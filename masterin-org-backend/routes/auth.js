const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database'); // Provides pool via db.pool or query via db.query
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const { sendEmail, SES_FROM_EMAIL } = require('../lib/emailService'); // Import email service

// User Registration
// POST /auth/signup
router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email format.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    // .escape() can be used on password if you are displaying it anywhere, but usually not needed for storage.
    // For role, we can check if it's one of the allowed values.
    // .trim() and .escape() are good general sanitizers for string inputs.
    body('role').optional().isIn(['student', 'teacher']).withMessage('Invalid role specified.').trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Sanitized values are available in req.body
      const { email, password, role } = req.body;

      // 1. Validate input (express-validator handles format and length, custom validation for existence etc. below)
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    // Role validation from schema/enum is implicitly handled by isIn, but default can be set here
    const userRole = role || 'student';

    // 2. Check if user already exists
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Save user to database
    const newUserQuery = `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, $3)
      RETURNING id, email, role, created_at, updated_at
    `;
    const newUserResult = await db.query(newUserQuery, [email, passwordHash, userRole]);
    const newlyCreatedUser = newUserResult.rows[0];

    // Send Welcome Email (fire and forget)
    if (SES_FROM_EMAIL && sendEmail && newlyCreatedUser) {
      const userEmailForWelcome = newlyCreatedUser.email;
      // 'full_name' is not available directly from signup, so derive from email or use generic
      const userNameForWelcome = newlyCreatedUser.full_name || userEmailForWelcome.split('@')[0];

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const subject = "Welcome to MasterIn.org!";
      const textBody = `Hello ${userNameForWelcome},\n\n` +
                       `Thank you for signing up at MasterIn.org! We're excited to have you join our learning community.\n\n` +
                       `Get started by exploring our courses: ${frontendUrl}/courses\n` +
                       `Or head to your dashboard: ${frontendUrl}/dashboard\n\n` +
                       `Happy learning!\n\n` +
                       `The MasterIn.org Team`;
      const htmlBody = `<html>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                          <p>Hello ${userNameForWelcome},</p>
                          <p>Thank you for signing up at MasterIn.org! We're excited to have you join our learning community.</p>
                          <p>Get started by <a href="${frontendUrl}/courses" style="color: #007bff; text-decoration: none;">exploring our courses</a> or head to <a href="${frontendUrl}/dashboard" style="color: #007bff; text-decoration: none;">your dashboard</a>.</p>
                          <p>Happy learning!</p>
                          <p>Thanks,<br/>The MasterIn.org Team</p>
                        </body>
                      </html>`;

      sendEmail({ to: userEmailForWelcome, subject, htmlBody, textBody })
        .then(emailResult => {
          if (emailResult.success) {
            console.log(`Welcome email sent to ${userEmailForWelcome}. Message ID: ${emailResult.messageId}`);
          } else {
            console.error(`Failed to send welcome email to ${userEmailForWelcome}: ${emailResult.error}`);
          }
        })
        .catch(error => {
          console.error(`Unexpected error while trying to send welcome email to ${userEmailForWelcome}:`, error);
        });
    } else {
      if (newlyCreatedUser) { // Check if user was actually created before logging skip
        console.log(`Welcome email for ${newlyCreatedUser.email} skipped: Email service (SES_FROM_EMAIL or sendEmail function) is not configured.`);
      }
    }

    res.status(201).json({
      message: 'User registered successfully.',
      user: newlyCreatedUser // Use the stored result
    });

  } catch (error) {
    console.error('Signup error:', error.stack);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// User Login
// POST /auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email format.'),
    body('password').notEmpty().withMessage('Password is required.'),
    // No need to escape password here as it's only used for comparison.
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Sanitized values are available in req.body
      const { email, password } = req.body;

      // 1. Validate input (express-validator handles format)
      // Additional business logic validation (e.g. user exists) follows

      // 2. Find user by email
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }
    const user = userResult.rows[0];

    // 3. Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Password incorrect.' });
    }

    // 4. Generate JWT
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };

    // Ensure JWT_SECRET is loaded
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET is not defined. Check your .env file.");
      return res.status(500).json({ message: "Server configuration error: JWT_SECRET missing." });
    }

    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: '1h' }, // Token expires in 1 hour, adjust as needed
      (err, token) => {
        if (err) throw err;
        const { password_hash, ...userWithoutPassword } = user;
        res.json({
          message: 'User logged in successfully.',
          token,
          user: userWithoutPassword,
        });
      }
    );

  } catch (error) {
    console.error('Login error:', error.stack);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// User Logout
// POST /auth/logout
router.post('/logout', (req, res) => {
  // For JWT, logout is typically handled client-side by deleting the token.
  // Server-side blacklisting is an option for immediate invalidation but adds complexity.
  // For this basic setup, we'll just acknowledge the request.
  res.status(200).json({ message: 'User logged out successfully. Please clear your token client-side.' });
});


// Request Password Reset
// POST /auth/request-password-reset
router.post(
  '/request-password-reset',
  [
    // Use 'email_address' to match frontend AuthContext if that's the standard there
    body('email_address').isEmail().withMessage('Please enter a valid email address.').normalizeEmail()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email_address } = req.body; // Changed from 'email'
    let client;

    try {
      client = await db.pool.connect(); // Use db.pool for explicit client
      const userResult = await client.query('SELECT id, email, full_name FROM users WHERE email = $1', [email_address]);

      // Always return a generic success message to prevent email enumeration
      // Actual email sending and token generation only happens if user exists.
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];

        await client.query('BEGIN'); // Start transaction

        // Invalidate previous *unused* tokens for this user by marking them as used
        // This prevents multiple active reset tokens.
        await client.query(
          "UPDATE password_reset_tokens SET used_at = NOW(), updated_at = NOW() WHERE user_id = $1 AND used_at IS NULL AND expires_at > NOW()",
          [user.id]
        );

        const resetToken = crypto.randomBytes(32).toString('hex');
        const salt = await bcrypt.genSalt(10); // bcrypt is already imported
        const hashedToken = await bcrypt.hash(resetToken, salt);
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

        await client.query(
          'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
          [user.id, hashedToken, expiresAt]
        );

        // Construct Reset Link
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'; // Fallback for local dev
        const resetLink = `${frontendUrl}/reset-password/${resetToken}`; // Path on frontend

        // Compose Email
        const subject = "Password Reset Request - MasterIn.org";
        const textBody = `Hello ${user.full_name || user.email},\n\n` +
                         `You requested a password reset for your MasterIn.org account. Please click the following link to reset your password:\n` +
                         `${resetLink}\n\n` +
                         `This link will expire in 1 hour. If you did not request this, please ignore this email.\n\n` +
                         `Thanks,\nThe MasterIn.org Team`;
        const htmlBody = `<html><body>
                          <p>Hello ${user.full_name || user.email},</p>
                          <p>You requested a password reset for your MasterIn.org account. Please click the link below to reset your password:</p>
                          <p><a href="${resetLink}">Reset Your Password</a></p>
                          <p>This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
                          <p>Thanks,<br/>The MasterIn.org Team</p>
                        </body></html>`;

        if (!SES_FROM_EMAIL || !sendEmail) { // Check from emailService if SES is configured and function exists
            console.warn(`SES_FROM_EMAIL or sendEmail function is not available. Password reset email for user ${user.email} will not be sent. Token: ${resetToken} (for dev/testing)`);
            // For development, you might still want to log the token if email sending fails.
        } else {
            const emailResult = await sendEmail({
              to: user.email,
              subject,
              htmlBody,
              textBody
            });

            if (emailResult.success) {
              console.log(`Password reset email sent to ${user.email}. Message ID: ${emailResult.messageId}`);
            } else {
              console.error(`Failed to send password reset email to ${user.email}:`, emailResult.error);
              // Non-critical error for client, but important for server logs.
              // The transaction for token generation should still commit.
            }
        }
        await client.query('COMMIT'); // Commit transaction for token generation
      }
      // Generic success response to client, regardless of whether user existed or email was sent
      res.json({ success: true, message: 'If your email is registered, a password reset link has been sent.' });

    } catch (error) {
      if (client) await client.query('ROLLBACK'); // Rollback on error during DB operations
      console.error('Error in /request-password-reset:', error.stack);
      // Still send a generic success message to the client for security.
      res.json({ success: true, message: 'If your email is registered, a password reset link has been sent.' });
    } finally {
      if (client) client.release();
    }
  }
);

// Reset Password
// POST /auth/reset-password
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required.'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, newPassword } = req.body;
    let client; // For explicit client management from the pool

    try {
      client = await db.pool.connect(); // Checkout a client from the pool

      // Refined approach: Iterate through valid tokens and compare. This is necessary because we only store hashes.
      const potentialTokensResult = await client.query(
        "SELECT id, user_id, token_hash FROM password_reset_tokens WHERE used_at IS NULL AND expires_at > NOW()"
      );

      let matchedTokenRecord = null;
      for (const record of potentialTokensResult.rows) {
        const isTokenMatch = await bcrypt.compare(token, record.token_hash);
        if (isTokenMatch) {
          matchedTokenRecord = record;
          break;
        }
      }

      if (!matchedTokenRecord) {
        // It's important to release the client even on early returns if it was connected.
        if (client) client.release();
        return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
      }

      // Valid token found, proceed to update password
      const newPasswordHash = await bcrypt.hash(newPassword, 10); // Salt rounds = 10

      await client.query('BEGIN'); // Start transaction
      await client.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [newPasswordHash, matchedTokenRecord.user_id]
      );
      await client.query(
        'UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1',
        [matchedTokenRecord.id]
      );
      await client.query('COMMIT'); // Commit transaction

      res.json({ success: true, message: 'Password has been reset successfully.' });

    } catch (error) {
      if (client) await client.query('ROLLBACK'); // Rollback transaction on error
      console.error('Error resetting password:', error.stack); // Log full error stack
      res.status(500).json({ success: false, message: 'Server error during password reset.' });
    } finally {
      if (client) {
        client.release(); // Release client back to the pool
      }
    }
  }
);


module.exports = router;
