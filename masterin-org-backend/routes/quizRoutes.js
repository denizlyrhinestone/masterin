const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { verifyToken } = require('../middleware/authMiddleware'); // Assuming student needs to be logged in
const { body, validationResult } = require('express-validator');

// GET /api/quizzes/diagnostic - Fetch diagnostic quiz questions
// No direct user input to sanitize here for the GET request itself,
// but verifyToken handles auth. quiz_id is hardcoded for now.
router.get('/diagnostic', verifyToken, async (req, res) => {
  try {
    // For now, fetch questions marked with quiz_id 'diagnostic_v1'
    // Later, this could be more dynamic
    const questionsQuery = `
      SELECT q.id, q.question_text, q.question_type,
             COALESCE(
               json_agg(
                 json_build_object('id', qo.id, 'option_text', qo.option_text)
               ) FILTER (WHERE qo.id IS NOT NULL),
               '[]'
             ) AS options
      FROM questions q
      LEFT JOIN question_options qo ON q.id = qo.question_id
      WHERE q.quiz_id = $1
      GROUP BY q.id, q.question_text, q.question_type
      ORDER BY q.id;
    `;
    const { rows: questions } = await db.query(questionsQuery, ['diagnostic_v1']);

    if (questions.length === 0) {
      // This could mean the seed data wasn't run or there are no questions for this quiz_id
      return res.status(404).json({ message: 'Diagnostic quiz questions not found.' });
    }

    res.json(questions);
  } catch (error) {
    console.error('Error fetching diagnostic quiz questions:', error.stack);
    res.status(500).json({ message: 'Server error fetching quiz questions.' });
  }
});

// POST /api/quizzes/diagnostic/submit - Submit diagnostic quiz answers
router.post(
  '/diagnostic/submit',
  verifyToken, // Auth middleware first
  [
    // Validate the answers array
    body('answers').isArray({ min: 1 }).withMessage('Answers array must not be empty.'),
    // Sanitize each field within each answer object
    // Note: For arrays of objects, express-validator needs specific handling.
    // We can use `body('answers.*.field')` but it's often simpler to iterate after basic validation
    // or use a custom validator if deep sanitization is critical.
    // For now, we'll focus on validating the structure and types.
    body('answers.*.question_id').isInt({ gt: 0 }).withMessage('question_id must be a positive integer.'),
    body('answers.*.selected_option_id').optional().isInt({ gt: 0 }).withMessage('selected_option_id must be a positive integer if provided.'),
    body('answers.*.answer_text').optional().isString().trim().escape().withMessage('answer_text must be a string if provided.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Sanitized values for individual fields in answers are now available if you re-access them from req.body.answers
    // However, express-validator's default sanitization on `answers.*.field` might not deeply modify the req.body.answers objects themselves
    // without custom middleware or explicit re-assignment.
    // For this phase, we assume the primary benefit is type checking and basic trimming/escaping.
    const { answers } = req.body;
    const studentId = req.user.id; // From verifyToken middleware
    const quizId = 'diagnostic_v1'; // Hardcoded for this specific diagnostic quiz

    // The initial check for answers array is now handled by express-validator's isArray
    // if (!answers || !Array.isArray(answers) || answers.length === 0) {
    //   return res.status(400).json({ message: 'Invalid submission format. Answers array is required.' });
    // }

    const client = await db.pool.connect(); // Use a client for transaction
  try {
    await client.query('BEGIN');

    // 1. Create a quiz attempt
    const attemptQuery = `
      INSERT INTO student_quiz_attempts (student_id, quiz_id, score)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    // Dummy score calculation for now. Real scoring would be complex for a diagnostic quiz.
    // For preference-based questions, "score" might be about completeness or used to categorize.
    // Here, we'll just put a placeholder score, e.g., 100 for completion.
    const dummyScore = 100;
    const attemptResult = await client.query(attemptQuery, [studentId, quizId, dummyScore]);
    const attemptId = attemptResult.rows[0].id;

    // 2. Store individual answers
    // Iterate through the validated 'answers' array from req.body
    for (const answer of req.body.answers) {
      // question_id is validated to be an integer.
      // selected_option_id is validated to be an integer if present.
      // answer_text is validated to be a string if present, and sanitized.
      const answerQuery = `
        INSERT INTO student_quiz_answers (attempt_id, question_id, selected_option_id, answer_text, is_correct)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await client.query(answerQuery, [
        attemptId,
        answer.question_id,
        answer.selected_option_id || null,
        answer.answer_text || null, // Use the potentially sanitized answer_text
        null
      ]);
    }

    await client.query('COMMIT');

    // 3. Potentially trigger learning path generation based on answers (future step)
    // For now, just confirm submission.
    res.status(201).json({
      message: 'Diagnostic quiz submitted successfully.',
      attempt_id: attemptId,
      // In a real scenario, you might return some initial feedback or next steps.
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error submitting diagnostic quiz:', error.stack);
    res.status(500).json({ message: 'Server error submitting quiz.' });
  } finally {
    client.release();
  }
});

module.exports = router;
