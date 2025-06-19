const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/taxonomy/subjects
// Fetches a distinct list of all subject values from courses and marketplace_products.
router.get('/subjects', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT subject FROM courses WHERE subject IS NOT NULL
      UNION
      SELECT DISTINCT subject FROM marketplace_products WHERE subject IS NOT NULL
      ORDER BY subject ASC;
    `;
    const { rows } = await db.query(query);
    res.json(rows.map(row => row.subject));
  } catch (error) {
    console.error('Error fetching distinct subjects:', error.stack);
    res.status(500).json({ message: 'Server error fetching subjects.' });
  }
});

// GET /api/taxonomy/grade-levels
// Fetches a distinct list of all grade_level values from courses and marketplace_products.
router.get('/grade-levels', async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT grade_level FROM courses WHERE grade_level IS NOT NULL
      UNION
      SELECT DISTINCT grade_level FROM marketplace_products WHERE grade_level IS NOT NULL
      ORDER BY grade_level ASC;
      -- Consider custom sorting for grade levels if simple ASC order is not ideal (e.g. K-2, 3-5, Middle, High)
    `;
    const { rows } = await db.query(query);
    res.json(rows.map(row => row.grade_level));
  } catch (error) {
    console.error('Error fetching distinct grade levels:', error.stack);
    res.status(500).json({ message: 'Server error fetching grade levels.' });
  }
});

// GET /api/taxonomy/tags
// Fetches a distinct list of all tags from the marketplace_products table.
router.get('/tags', async (req, res) => {
  try {
    // This query unnests the tags array, selects distinct tags, and orders them.
    const query = `
      SELECT DISTINCT unnest(tags) AS tag
      FROM marketplace_products
      WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
      ORDER BY tag ASC;
    `;
    const { rows } = await db.query(query);
    res.json(rows.map(row => row.tag));
  } catch (error) {
    console.error('Error fetching distinct tags:', error.stack);
    res.status(500).json({ message: 'Server error fetching tags.' });
  }
});

// Note: GET /api/taxonomy/career-paths is effectively handled by GET /api/career-paths in careerPathRoutes.js
// No need to duplicate that logic here. If specific transformations were needed for a "taxonomy" view,
// then it might be considered.

module.exports = router;
