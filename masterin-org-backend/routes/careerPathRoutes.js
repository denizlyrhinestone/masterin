const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/career-paths - Fetch all available career paths
router.get('/', async (req, res) => { // No token needed to browse career paths initially
  try {
    const { rows: careerPaths } = await db.query('SELECT id, name, description, related_skills FROM career_paths ORDER BY name');
    if (careerPaths.length === 0) {
        // This might happen if seed data wasn't run
        return res.status(404).json({ message: 'No career paths found. Please ensure database is seeded.' });
    }
    res.json(careerPaths);
  } catch (error) {
    console.error('Error fetching career paths:', error.stack);
    res.status(500).json({ message: 'Server error fetching career paths.' });
  }
});

// POST /api/career-paths/select - Allow a student to select/update their career path
router.post('/select', verifyToken, async (req, res) => {
  const { career_path_id } = req.body;
  const studentId = req.user.id; // From verifyToken middleware

  if (!career_path_id) {
    return res.status(400).json({ message: 'Career path ID is required.' });
  }

  try {
    // Check if the career path exists
    const careerPathExists = await db.query('SELECT id FROM career_paths WHERE id = $1', [career_path_id]);
    if (careerPathExists.rows.length === 0) {
      return res.status(404).json({ message: 'Selected career path not found.' });
    }

    // Upsert: Create a new learning pathway or update if one already exists for this student for this career_path_id
    // Or, if a student can only have one active pathway, you might want to mark others as 'archived' or similar.
    // For now, we'll assume one active pathway tied to a career_path, or a new one is created.
    // This logic might also involve generating `path_data` based on the career path.

    const upsertQuery = `
      INSERT INTO learning_pathways (student_id, career_path_id, path_data, status)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (student_id, career_path_id) DO UPDATE
      SET
        updated_at = CURRENT_TIMESTAMP,
        status = COALESCE(EXCLUDED.status, learning_pathways.status) -- Keep existing status if not specified in update
        -- Potentially update path_data if it needs regeneration: path_data = EXCLUDED.path_data
      RETURNING id, career_path_id, status, created_at, updated_at;
    `;

    // Placeholder path_data. In a real system, this would be generated based on the career path.
    const placeholderPathData = {
      message: `Pathway for career_path_id ${career_path_id} needs to be generated.`,
      courses: [] // e.g., list of course IDs relevant to this career path
    };

    const { rows: [learningPathway] } = await db.query(upsertQuery, [
      studentId,
      career_path_id,
      JSON.stringify(placeholderPathData), // path_data should be JSONB
      'not-started' // Default status for a new or re-selected path
    ]);

    res.status(201).json({
      message: 'Career path selected successfully.',
      learning_pathway: learningPathway
    });

  } catch (error) {
    console.error('Error selecting career path:', error.stack);
    if (error.code === '23503') { // Foreign key violation
        return res.status(400).json({ message: 'Invalid student ID or career path ID provided.' });
    }
    res.status(500).json({ message: 'Server error selecting career path.' });
  }
});

module.exports = router;
