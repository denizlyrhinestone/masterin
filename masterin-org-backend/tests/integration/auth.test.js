const request = require('supertest');
const { setupMockDb } = require('./dbMockSetup'); // Utility to get a fresh pg-mem instance
const { sendEmail } = require('../../lib/emailService'); // Import to mock

// This will hold the pg-mem instance for the current test suite
let mockDbInstance;

// Mock the database module
jest.mock('../../db/database', () => {
  // Important: This factory function is called BEFORE any imports in this file.
  // So, setupMockDb() is called, and mockDbInstance is set.
  mockDbInstance = setupMockDb();
  return {
    // Mock the 'pool' object that the application uses
    pool: mockDbInstance.adapters.createPg().pool, // Provides a pg-Pool compatible interface from pg-mem
    // If your application uses db.query directly:
    query: (text, params) => mockDbInstance.public.query(text, params),
    // Keep executeSchema if it's called by app startup and you want to control it or ensure it runs on mock
    executeSchema: async () => { /* console.log('Mocked executeSchema called'); */ }
  };
});

// Mock the emailService for auth routes that send emails
jest.mock('../../lib/emailService', () => ({
  ...jest.requireActual('../../lib/emailService'), // Keep other exports like SES_FROM_EMAIL if it's checked
  sendEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'mock-email-message-id' }),
  SES_FROM_EMAIL: 'test-sender@example.com' // Ensure this is mocked if checked by the route
}));

// Now, import the app AFTER the mocks are set up
const app = require('../../index');

describe('Auth Endpoints', () => {

  beforeEach(async () => {
    // Clear relevant tables before each test using the mockDbInstance
    // This ensures test isolation if a test modifies data.
    // CASCADE will also clear dependent tables like password_reset_tokens if users are truncated.
    if (mockDbInstance) {
        await mockDbInstance.public.query('TRUNCATE users, password_reset_tokens RESTART IDENTITY CASCADE;');
    }
    sendEmail.mockClear(); // Clear email mock history
    process.env.FRONTEND_URL = 'http://testhost:7000'; // Set for password reset links
  });

  afterAll(() => {
    // Clean up any global state if necessary, e.g., close mockDbInstance if it had persistent aspects
    // For pg-mem, typically it's self-contained per newDb() call used by jest.mock factory.
    delete process.env.FRONTEND_URL;
  });

  describe('POST /auth/signup', () => {
    it('should register a new student successfully', async () => {
      const res = await request(app)
        .post('/auth/signup') // Assuming app is mounted without /api prefix for auth routes
        .send({
          email: 'student@example.com', // Changed from email_address to match backend body validation
          password: 'Password123!',
          role: 'student'
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toBe('User registered successfully.');
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('student@example.com');
      expect(res.body.user.role).toBe('student');

      // Verify in mock DB
      const userInDb = await mockDbInstance.public.oneOrNone('SELECT * FROM users WHERE email = $1', ['student@example.com']);
      expect(userInDb).toBeDefined();
      expect(userInDb.role).toBe('student');

      // Verify welcome email was "sent"
      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'student@example.com',
        subject: 'Welcome to MasterIn.org!',
      }));
    });

    it('should return 409 if email already exists', async () => {
      await request(app) // First registration
        .post('/auth/signup')
        .send({ email: 'test@example.com', password: 'Password123!', role: 'student' });

      const res = await request(app) // Second attempt
        .post('/auth/signup')
        .send({ email: 'test@example.com', password: 'Password123!', role: 'student' });

      expect(res.statusCode).toEqual(409);
      expect(res.body.message).toBe('User with this email already exists.');
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({ email: 'invalidemail', password: 'Password123!', role: 'student' });
      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toEqual(expect.arrayContaining([
        expect.objectContaining({ msg: 'Invalid email format.' })
      ]));
    });

    it('should return 400 for short password', async () => {
        const res = await request(app)
          .post('/auth/signup')
          .send({ email: 'shortpass@example.com', password: '123', role: 'student' });
        expect(res.statusCode).toEqual(400);
        // The exact message depends on which validation catches it first (manual or express-validator)
        // The provided route code has manual checks before express-validator for some fields.
        // The express-validator one is "Password must be at least 6 characters long."
        // The manual check also states "Password must be at least 6 characters long."
        expect(res.body.message || res.body.errors[0].msg).toBe('Password must be at least 6 characters long.');
      });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Seed a user for login tests
      const passwordHash = await require('bcryptjs').hash('Password123!', 10);
      await mockDbInstance.public.query(
        "INSERT INTO users (email, password_hash, role, full_name) VALUES ($1, $2, 'teacher', 'Test Teacher')",
        ['teacher@example.com', passwordHash]
      );
    });

    it('should login an existing user successfully', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'teacher@example.com', password: 'Password123!' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toBe('User logged in successfully.');
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('teacher@example.com');
      expect(res.body.user.role).toBe('teacher');
    });

    it('should return 401 for incorrect password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'teacher@example.com', password: 'WrongPassword!' });
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Invalid credentials. Password incorrect.');
    });

    it('should return 401 for non-existent user', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'nouser@example.com', password: 'Password123!' });
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Invalid credentials. User not found.');
    });
  });

  describe('Password Reset Flow', () => {
    let userEmail = 'reset@example.com';
    let userId;

    beforeEach(async () => {
      const passwordHash = await require('bcryptjs').hash('OldPassword123!', 10);
      const userRes = await mockDbInstance.public.query(
        "INSERT INTO users (email, password_hash, role, full_name) VALUES ($1, $2, 'student', 'Reset User') RETURNING id",
        [userEmail, passwordHash]
      );
      userId = userRes.rows[0].id;
    });

    it('POST /auth/request-password-reset should send email and return generic success', async () => {
      sendEmail.mockResolvedValue({ success: true, messageId: 'mock-reset-id' }); // Ensure mock is set for this call

      const res = await request(app)
        .post('/auth/request-password-reset')
        .send({ email_address: userEmail }); // Backend expects email_address

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('If your email is registered, a password reset link has been sent.');
      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: userEmail,
        subject: 'Password Reset Request - MasterIn.org',
      }));
    });

    it('POST /auth/reset-password should reset password with a valid token and invalidate token', async () => {
        // 1. Request password reset to get a token (simulated via DB check)
        await request(app).post('/auth/request-password-reset').send({ email_address: userEmail });

        // Retrieve the token from DB (this part is tricky as it's hashed)
        // For testing, we'd need to either:
        //  a) Capture the plain token if logged by the (mocked) email service or by temporarily modifying the route for tests
        //  b) For this test, let's assume we can grab the latest token_hash for the user and we'd need a way to get the plain token
        //  Since the route logs the plain token when email service is off, we can rely on that for a test mode.
        //  For now, we will "guess" the token by inserting a known one or querying for the latest hash.
        //  Let's insert a known token hash that matches a known plain token for testability.

        const plainTestToken = "testabletoken1234567890abcdefghijklmnopqrstuvwxyz";
        const hashedTestToken = await require('bcryptjs').hash(plainTestToken, 10);
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        // Clear any existing tokens and insert our testable one
        await mockDbInstance.public.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);
        const tokenInsertRes = await mockDbInstance.public.query(
            'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3) RETURNING id',
            [userId, hashedTestToken, expiresAt]
        );
        const tokenId = tokenInsertRes.rows[0].id;

        // 2. Attempt to reset password
        const newPassword = 'NewPassword123!';
        const res = await request(app)
          .post('/auth/reset-password')
          .send({ token: plainTestToken, newPassword });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Password has been reset successfully.');

        // 3. Verify password changed in DB
        const updatedUser = await mockDbInstance.public.one('SELECT password_hash FROM users WHERE id = $1', [userId]);
        const isNewPasswordMatch = await require('bcryptjs').compare(newPassword, updatedUser.password_hash);
        expect(isNewPasswordMatch).toBe(true);

        // 4. Verify token was marked as used
        const usedToken = await mockDbInstance.public.one('SELECT used_at FROM password_reset_tokens WHERE id = $1', [tokenId]);
        expect(usedToken.used_at).not.toBeNull();
    });

    it('should return 400 for invalid or expired token on reset password', async () => {
        const res = await request(app)
          .post('/auth/reset-password')
          .send({ token: 'invalidOrExpiredToken', newPassword: 'NewPassword123!' });
        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Invalid or expired reset token.');
    });
  });
});
