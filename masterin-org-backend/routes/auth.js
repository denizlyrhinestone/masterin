const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');

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
    const newUser = await db.query(newUserQuery, [email, passwordHash, userRole]);

    res.status(201).json({
      message: 'User registered successfully.',
      user: newUser.rows[0]
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
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userResult.rows.length === 0) {
        // IMPORTANT: Do not reveal if email exists or not for security (prevents email enumeration)
        console.log(`Password reset requested for non-existent email: ${email}`);
        return res.status(200).json({ message: 'If your email is registered, a password reset link has been sent.' });
      }
      const user = userResult.rows[0];

      // Invalidate previous tokens for this user
      await db.query('DELETE FROM password_reset_tokens WHERE user_id = $1 AND used_at IS NULL', [user.id]);

      const resetToken = crypto.randomBytes(32).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const tokenHash = await bcrypt.hash(resetToken, salt);

      const expiresAt = new Date(Date.now() + 3600000); // Token expires in 1 hour

      await db.query(
        'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [user.id, tokenHash, expiresAt]
      );

      // In a real application, you would email this resetToken (or a link containing it) to the user.
      // For this exercise, we log it and send it in response for testing.
      console.log(`Password reset token for ${user.email} (user_id: ${user.id}): ${resetToken} (Hashed: ${tokenHash})`);

      // IMPORTANT: DO NOT SEND THE PLAIN TOKEN IN PRODUCTION RESPONSE. This is for dev/testing only.
      res.status(200).json({
        message: 'If your email is registered, a password reset link has been sent.',
        _dev_token: resetToken // For testing purposes ONLY
      });

    } catch (error) {
      console.error('Request password reset error:', error.stack);
      res.status(500).json({ message: 'Server error during password reset request.' });
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
