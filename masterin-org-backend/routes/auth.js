const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database'); // Assuming db/database.js exports a query function

// User Registration
// POST /auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1. Validate input
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
    const validRoles = ['student', 'teacher']; // Admin role might be set manually or by other means
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified. Allowed roles: student, teacher.' });
    }
    const userRole = role || 'student'; // Default to 'student' if no role is provided

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
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

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

module.exports = router;
