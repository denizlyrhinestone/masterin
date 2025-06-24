const express = require('express');
const router = express.Router();
const db = require('../db/database'); // Provides pool via db.pool or query via db.query
const { verifyToken } = require('../middleware/authMiddleware');
const { body, param, validationResult } = require('express-validator'); // Added body
const bcryptjs = require('bcryptjs'); // Added bcryptjs
const { ensureStudentProgressRecord } = require('../lib/progressService');
const { getPublicS3Url } = require('../lib/s3Service'); // Import S3 utility


// GET /api/users/my-badges
router.get('/my-badges', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const query = `
      SELECT
        ub.id as user_badge_id,
        b.id as badge_id,
        b.name,
        b.description,
        b.icon_url,
        ub.achieved_at
      FROM user_badges ub
      JOIN badges b ON ub.badge_id = b.id
      WHERE ub.user_id = $1
      ORDER BY ub.achieved_at DESC;
    `;
    const { rows: userBadges } = await db.query(query, [userId]);
    res.json(userBadges);
  } catch (error) {
    console.error('Error fetching user badges:', error.stack);
    res.status(500).json({ success: false, message: 'Server error fetching user badges.' });
  }
});

// GET /api/users/student-progress/:courseId
router.get(
  '/student-progress/:courseId',
  verifyToken,
  [
    param('courseId').isInt({ gt: 0 }).withMessage('Course ID must be a positive integer.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { courseId } = req.params;
    const userId = req.user.id;
    let client;

    try {
      client = await db.pool.connect(); // Get a client from the pool for ensureStudentProgressRecord
      const progressRecord = await ensureStudentProgressRecord(userId, parseInt(courseId, 10), client);
      if (!progressRecord) { // This might happen if ensureStudentProgressRecord throws or returns null on pathway issue
          return res.status(404).json({ success: false, message: "Could not get or create progress record for this course, possibly due to missing learning pathway."})
      }
      res.json({ success: true, progress: progressRecord });
    } catch (error) {
      console.error(`Error fetching or ensuring student progress for course ${courseId}, user ${userId}:`, error.stack);
      res.status(500).json({ success: false, message: 'Server error handling student progress.' });
    } finally {
      if (client) {
        client.release();
      }
    }
  }
);

// GET /api/users/profile/me
router.get('/profile/me', verifyToken, async (req, res) => {
  try {
    const result = await db.pool.query(
      `SELECT u.id, u.email, u.role, u.full_name, u.bio, u.social_links, u.created_at,
              u.profile_picture_file_id, uf.file_path as profile_s3_key
       FROM users u
       LEFT JOIN uploaded_files uf ON u.profile_picture_file_id = uf.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    const profile = result.rows[0];
    if (profile.profile_s3_key) {
      profile.profile_picture_url = getPublicS3Url(profile.profile_s3_key);
    } else {
      profile.profile_picture_url = null; // Or a default avatar URL
    }
    // delete profile.profile_s3_key; // Optionally remove the key from the response

    res.json({ success: true, profile: profile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Server error fetching profile.' });
  }
});

// PUT /api/users/profile/me
router.put(
  '/profile/me',
  verifyToken,
  [
    body('full_name').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Full name must be between 1 and 255 characters.').escape(),
    body('bio').optional().trim().isLength({ max: 1000 }).withMessage('Bio can be up to 1000 characters.').escape(),
    body('profile_picture_file_id').optional({ nullable: true }).isInt().withMessage('Profile picture file ID must be an integer or null.'),
    body('social_links').optional({ nullable: true }).isJSON().withMessage('Social links must be a valid JSON object.'), // Changed from isObject() to isJSON() for string input
    // More specific validation for common social links if they are expected (client should send JSON string for social_links)
    // Example: body('social_links.linkedin').optional({ checkFalsy: true }).isURL().withMessage('LinkedIn profile URL must be a valid URL.'),
    // For JSON string input, such deep validation is harder with express-validator directly. Client should ensure structure.
    // Or, use custom validator for social_links content.
    body('social_links.linkedin').custom((value, { req }) => {
        if (req.body.social_links && typeof req.body.social_links === 'object' && value && !(typeof value === 'string' && value.startsWith('http'))) {
            throw new Error('LinkedIn profile URL must be a valid URL.');
        }
        if (typeof req.body.social_links === 'string') { // if social_links is a JSON string
            try {
                const parsed = JSON.parse(req.body.social_links);
                if (parsed.linkedin && !(typeof parsed.linkedin === 'string' && parsed.linkedin.startsWith('http'))) {
                    throw new Error('LinkedIn profile URL must be a valid URL.');
                }
            } catch (e) { /* ignore parsing error, main isJSON will catch it */ }
        }
        return true;
    }).optional({ checkFalsy: true }),
    body('social_links.twitter').custom((value, { req }) => {
        if (req.body.social_links && typeof req.body.social_links === 'object' && value && !(typeof value === 'string' && value.startsWith('http'))) {
            throw new Error('Twitter profile URL must be a valid URL.');
        }
        if (typeof req.body.social_links === 'string') {
             try {
                const parsed = JSON.parse(req.body.social_links);
                if (parsed.twitter && !(typeof parsed.twitter === 'string' && parsed.twitter.startsWith('http'))) {
                    throw new Error('Twitter profile URL must be a valid URL.');
                }
            } catch (e) { /* ignore */ }
        }
        return true;
    }).optional({ checkFalsy: true }),
    body('social_links.website').custom((value, { req }) => {
        if (req.body.social_links && typeof req.body.social_links === 'object' && value && !(typeof value === 'string' && value.startsWith('http'))) {
            throw new Error('Website URL must be a valid URL.');
        }
         if (typeof req.body.social_links === 'string') {
            try {
                const parsed = JSON.parse(req.body.social_links);
                if (parsed.website && !(typeof parsed.website === 'string' && parsed.website.startsWith('http'))) {
                    throw new Error('Website URL must be a valid URL.');
                }
            } catch (e) { /* ignore */ }
        }
        return true;
    }).optional({ checkFalsy: true })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const userId = req.user.id;
    // Destructure profile_picture_file_id instead of profile_picture_url
    const { full_name, bio, profile_picture_file_id } = req.body;
    let { social_links } = req.body; // social_links might be JSON string

    // If social_links is a string, parse it.
    if (social_links && typeof social_links === 'string') {
        try {
            social_links = JSON.parse(social_links);
        } catch (e) {
            return res.status(400).json({ success: false, message: 'Invalid JSON string for social_links.' });
        }
    }


    const updateFields = [];
    const values = [];
    let queryIndex = 1;

    if (full_name !== undefined) {
      updateFields.push(`full_name = $${queryIndex++}`);
      values.push(full_name);
    }
    if (bio !== undefined) {
      updateFields.push(`bio = $${queryIndex++}`);
      values.push(bio);
    }
    // Use profile_picture_file_id
    if (profile_picture_file_id !== undefined) {
      updateFields.push(`profile_picture_file_id = $${queryIndex++}`);
      values.push(profile_picture_file_id === "" || profile_picture_file_id === null ? null : parseInt(profile_picture_file_id, 10));
    }
    if (social_links !== undefined) {
      updateFields.push(`social_links = $${queryIndex++}`);
      values.push(social_links);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields provided for update.' });
    }

    updateFields.push(`updated_at = NOW()`); // Add updated_at field
    values.push(userId); // For the WHERE clause: WHERE id = $last_index

    const setClauses = updateFields.join(', ');

    try {
      // Update returning clause to include profile_picture_file_id
      const updateQuery = `UPDATE users SET ${setClauses} WHERE id = $${queryIndex} RETURNING id, email, role, full_name, bio, profile_picture_file_id, social_links, updated_at`;
      const updateResult = await db.pool.query(updateQuery, values);

      if (updateResult.rows.length === 0) {
         return res.status(404).json({ success: false, message: 'User not found or no update made.'});
      }

      // Refetch with join for profile_picture_url for consistency in response
      const updatedProfileResult = await db.pool.query(
        `SELECT u.id, u.email, u.role, u.full_name, u.bio, u.social_links, u.created_at, uf.file_path as profile_picture_url, u.profile_picture_file_id
         FROM users u
         LEFT JOIN uploaded_files uf ON u.profile_picture_file_id = uf.id
         WHERE u.id = $1`,
        [userId]
      );
      res.json({ success: true, message: 'Profile updated successfully.', profile: updatedProfileResult.rows[0] });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ success: false, message: 'Server error updating profile.' });
    }
  }
);

// POST /api/users/profile/change-password
router.post(
  '/profile/change-password',
  verifyToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long.')
      .matches(/\d/).withMessage('New password must contain a number.')
      .matches(/[a-zA-Z]/).withMessage('New password must contain a letter.')
      // Consider adding .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain a special character.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    try {
      const userResult = await db.pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]); // Assuming db object has pool property
      if (userResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      const storedHash = userResult.rows[0].password_hash;

      const isMatch = await bcryptjs.compare(currentPassword, storedHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect current password.' });
      }

      const newPasswordHash = await bcryptjs.hash(newPassword, 10);
      await db.pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newPasswordHash, userId]); // Assuming db object has pool property

      res.json({ success: true, message: 'Password changed successfully.' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ success: false, message: 'Server error changing password.' });
    }
  }
);

// GET /api/users/my-purchased-products - List products purchased by the current user
router.get('/my-purchased-products', verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const query = `
      SELECT
        upp.id AS purchase_id,
        upp.product_id,
        upp.purchased_at,
        upp.price_paid,
        upp.transaction_id,
        mp.title AS product_title,
        mp.description AS product_description,
        mp.thumbnail_url AS product_thumbnail_url,
        mp.seller_id AS product_seller_id,
        seller.full_name AS product_seller_name
      FROM user_product_purchases upp
      JOIN marketplace_products mp ON upp.product_id = mp.id
      JOIN users seller ON mp.seller_id = seller.id
      WHERE upp.user_id = $1
      ORDER BY upp.purchased_at DESC;
    `;
    const { rows: purchasedProducts } = await db.query(query, [userId]);
    res.json({ success: true, purchasedProducts });
  } catch (error) {
    console.error('Error fetching purchased products:', error.stack);
    res.status(500).json({ success: false, message: 'Server error fetching purchased products.' });
  }
});

module.exports = router;
