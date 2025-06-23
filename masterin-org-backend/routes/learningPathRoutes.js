const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { verifyToken } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

// GET /api/learning-paths/my-path - Fetch the current student's active learning path
// No user-provided input to sanitize for this GET request, beyond what verifyToken handles.
router.get('/my-path', verifyToken, async (req, res) => {
  const studentId = req.user.id;

  try {
    // Fetch the most recent active (or 'in-progress', or 'not-started') learning pathway for the student.
    // This query might need refinement based on how "active" pathway is defined.
    // For now, let's assume the one with the highest ID or most recent created_at if multiple exist.
    // Or, if a student can only have one 'in-progress' or 'not-started' path.
    const pathwayQuery = `
      SELECT
        lp.id,
        lp.career_path_id,
        cp.name as career_path_name,
        lp.path_data,
        lp.status,
        lp.created_at,
        lp.updated_at,
        (SELECT COALESCE(json_agg(
            json_build_object(
              'course_id', sp.course_id,
              'course_title', c.title,
              'status', sp.status,
              'progress_percentage', sp.progress_percentage,
              'last_accessed_at', sp.last_accessed_at
            ) ORDER BY c.id ASC -- Or some other defined order for courses in path
          ), '[]')
         FROM student_progress sp
         JOIN courses c ON sp.course_id = c.id
         WHERE sp.learning_pathway_id = lp.id
        ) as progress_details
      FROM learning_pathways lp
      LEFT JOIN career_paths cp ON lp.career_path_id = cp.id
      WHERE lp.student_id = $1
      AND lp.status IN ('in-progress', 'not-started') -- Example: Only fetch active pathways
      ORDER BY lp.updated_at DESC -- Get the most recently updated active pathway
      LIMIT 1;
    `;
    const { rows: [learningPathway] } = await db.query(pathwayQuery, [studentId]);

    if (!learningPathway) {
      return res.status(404).json({ message: 'No active learning path found for the student.' });
    }

    res.json(learningPathway);
  } catch (error) {
    console.error('Error fetching learning path:', error.stack);
    res.status(500).json({ message: 'Server error fetching learning path.' });
  }
});

// POST /api/learning-paths/update-progress - Update progress on a course in the learning path
router.post(
  '/update-progress',
  verifyToken,
  [
    body('learning_pathway_id').isInt({ gt: 0 }).withMessage('Learning pathway ID must be a positive integer.'),
    body('course_id').isInt({ gt: 0 }).withMessage('Course ID must be a positive integer.'),
    body('status').isIn(['not-started', 'in-progress', 'completed', 'skipped']).trim().escape().withMessage('Invalid status provided.'),
    body('progress_percentage').optional().isInt({ min: 0, max: 100 }).withMessage('Progress percentage must be between 0 and 100.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const studentId = req.user.id;
    // Values from req.body are now validated and potentially sanitized
    const { learning_pathway_id, course_id, status, progress_percentage } = req.body;

    // Manual validation for requirements already handled by express-validator .isInt and .isIn
    // if (!learning_pathway_id || !course_id || !status) {
    //   return res.status(400).json({ message: 'Learning pathway ID, course ID, and status are required.' });
    // }
    // const validStatuses = ['not-started', 'in-progress', 'completed', 'skipped'];
    // if (!validStatuses.includes(status)) {
    //   return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    // }
    // if (progress_percentage !== undefined && (typeof progress_percentage !== 'number' || progress_percentage < 0 || progress_percentage > 100)) {
    //   return res.status(400).json({ message: 'Progress percentage must be a number between 0 and 100.' });
    // }

    try {
    // First, verify that the learning_pathway_id belongs to the authenticated student to prevent unauthorized updates.
    const pathwayCheck = await db.query(
      'SELECT id FROM learning_pathways WHERE id = $1 AND student_id = $2',
      [learning_pathway_id, studentId]
    );
    if (pathwayCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own learning pathway progress.' });
    }

    // Upsert progress: Create or update the student's progress for a specific course in their pathway.
    const upsertProgressQuery = `
      INSERT INTO student_progress (learning_pathway_id, course_id, status, progress_percentage, last_accessed_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (learning_pathway_id, course_id) DO UPDATE
      SET
        status = EXCLUDED.status,
        progress_percentage = COALESCE(EXCLUDED.progress_percentage, student_progress.progress_percentage),
        last_accessed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const { rows: [updatedProgress] } = await db.query(upsertProgressQuery, [
      learning_pathway_id,
      course_id,
      status,
      progress_percentage === undefined ? null : progress_percentage // Use null if not provided, allowing DB default or keeping existing
    ]);

    // Optionally, update the overall learning_pathway status if all courses are completed
    // This would require more complex logic to check all courses in path_data
    // For now, we'll leave this as a future enhancement.

    res.status(200).json({
      message: 'Progress updated successfully.',
      progress: updatedProgress
    });

  } catch (error) {
    console.error('Error updating learning progress:', error.stack);
    if (error.code === '23503') { // Foreign key violation (e.g. course_id doesn't exist)
        return res.status(400).json({ message: 'Invalid learning pathway ID or course ID.' });
    }
    res.status(500).json({ message: 'Server error updating progress.' });
  }
});

module.exports = router;
