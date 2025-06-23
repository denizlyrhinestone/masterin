const express = require('express');
const router = express.Router();
const db = require('../db/database'); // Assuming db.query or db.pool is available
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { query, param, body, validationResult } = require('express-validator');

// Apply admin-only middleware at router level
router.use(verifyToken);
router.use(checkRole(['admin'])); // All routes in this file require admin role

// --- User Management Endpoints ---

// GET /api/admin/users - List all users with pagination
router.get(
  '/users',
  [
    query('page').optional().isInt({ min: 1 }).toInt().withMessage('Page must be a positive integer.'),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('Limit must be between 1 and 100.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const offset = (page - 1) * limit;

    try {
      const usersResult = await db.query(
        'SELECT id, email, full_name, role, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );

      const totalUsersResult = await db.query('SELECT COUNT(*) AS total_users FROM users');

      res.json({
        success: true,
        users: usersResult.rows,
        totalUsers: parseInt(totalUsersResult.rows[0].total_users, 10),
        page,
        limit,
        totalPages: Math.ceil(totalUsersResult.rows[0].total_users / limit)
      });
    } catch (error) {
      console.error('Error fetching users for admin:', error.stack);
      res.status(500).json({ success: false, message: 'Server error fetching users.' });
    }
  }
);

// PUT /api/admin/users/:userId/role - Update a user's role
router.put(
  '/users/:userId/role',
  [
    param('userId').isInt({ gt: 0 }).withMessage('User ID must be a positive integer.'),
    body('role').isIn(['student', 'teacher', 'admin']).withMessage('Invalid role specified.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { userId } = req.params;
    const { role } = req.body;

    try {
      const updateResult = await db.query(
        'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, full_name, role, updated_at',
        [role, userId]
      );

      if (updateResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      res.json({ success: true, message: 'User role updated successfully.', user: updateResult.rows[0] });
    } catch (error) {
      console.error(`Error updating role for user ${userId}:`, error.stack);
      res.status(500).json({ success: false, message: 'Server error updating user role.' });
    }
  }
);

// --- Content Moderation Endpoints ---

// GET /api/admin/content/pending-review - List content pending review (courses and products)
router.get(
  '/content/pending-review',
  [
    query('page').optional().isInt({ min: 1 }).toInt().withMessage('Page must be a positive integer.'),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('Limit must be between 1 and 100.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const offset = (page - 1) * limit;

    try {
      // Fetch courses pending review with creator info
      const coursesQuery = `
        SELECT
          c.id, c.title, c.created_by AS created_by_user_id, u.email AS creator_email, u.full_name AS creator_name,
          c.created_at, 'course' as content_type, c.review_status as status
        FROM courses c
        JOIN users u ON c.created_by = u.id
        WHERE c.review_status = 'pending_review'
      `;

      // Fetch marketplace products pending review with seller info
      const productsQuery = `
        SELECT
          mp.id, mp.title, mp.seller_id AS created_by_user_id, u.email AS creator_email, u.full_name AS creator_name,
          mp.created_at, 'product' as content_type, mp.status
        FROM marketplace_products mp
        JOIN users u ON mp.seller_id = u.id
        WHERE mp.status = 'pending_review'
      `;

      const [coursesResult, productsResult] = await Promise.all([
        db.query(coursesQuery),
        db.query(productsQuery)
      ]);

      const combinedItems = [...coursesResult.rows, ...productsResult.rows];

      // Sort combined items by creation date descending
      combinedItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      const totalItems = combinedItems.length;
      const paginatedItems = combinedItems.slice(offset, offset + limit);

      res.json({
        success: true,
        items: paginatedItems,
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit)
      });

    } catch (error) {
      console.error('Error fetching content pending review:', error.stack);
      res.status(500).json({ success: false, message: 'Server error fetching content for review.' });
    }
  }
);

// POST /api/admin/content/:contentType/:contentId/approve
router.post(
  '/content/:contentType/:contentId/approve',
  [
    param('contentType').isIn(['course', 'product']).withMessage('Invalid content type.'),
    param('contentId').isInt({ gt: 0 }).withMessage('Content ID must be a positive integer.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { contentType, contentId } = req.params;
    let updateQuery = '';
    let resultField = '';

    if (contentType === 'course') {
      updateQuery = 'UPDATE courses SET review_status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, title, review_status';
      resultField = 'course';
    } else { // product
      updateQuery = 'UPDATE marketplace_products SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, title, status';
      resultField = 'product';
    }

    try {
      const { rows } = await db.query(updateQuery, [contentType === 'course' ? 'published' : 'approved', contentId]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: `${contentType} not found or no change needed.` });
      }
      res.json({ success: true, message: `${contentType} approved successfully.`, [resultField]: rows[0] });
    } catch (error) {
      console.error(`Error approving ${contentType} ${contentId}:`, error.stack);
      res.status(500).json({ success: false, message: `Server error approving ${contentType}.` });
    }
  }
);

// POST /api/admin/content/:contentType/:contentId/reject
router.post(
  '/content/:contentType/:contentId/reject',
  [
    param('contentType').isIn(['course', 'product']).withMessage('Invalid content type.'),
    param('contentId').isInt({ gt: 0 }).withMessage('Content ID must be a positive integer.')
    // Optional: body('reason').trim().escape() if a rejection reason is to be stored/sent
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { contentType, contentId } = req.params;
    let updateQuery = '';
    let resultField = '';

    if (contentType === 'course') {
      updateQuery = 'UPDATE courses SET review_status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, title, review_status';
      resultField = 'course';
    } else { // product
      updateQuery = 'UPDATE marketplace_products SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, title, status';
      resultField = 'product';
    }

    try {
      const { rows } = await db.query(updateQuery, ['rejected', contentId]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: `${contentType} not found or no change needed.` });
      }
      res.json({ success: true, message: `${contentType} rejected successfully.`, [resultField]: rows[0] });
    } catch (error) {
      console.error(`Error rejecting ${contentType} ${contentId}:`, error.stack);
      res.status(500).json({ success: false, message: `Server error rejecting ${contentType}.` });
    }
  }
);

module.exports = router;
