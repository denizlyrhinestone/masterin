const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { verifyToken } = require('../middleware/authMiddleware'); // Assuming student needs to be logged in

// GET /api/quizzes/diagnostic - Fetch diagnostic quiz questions
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
router.post('/diagnostic/submit', verifyToken, async (req, res) => {
  const { answers } = req.body; // Expected format: [{ question_id: 1, selected_option_id: 3, answer_text: "..."}]
  const studentId = req.user.id; // From verifyToken middleware
  const quizId = 'diagnostic_v1'; // Hardcoded for this specific diagnostic quiz

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ message: 'Invalid submission format. Answers array is required.' });
  }

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
    for (const answer of answers) {
      if (!answer.question_id) {
        throw new Error('Each answer must have a question_id.'); // This will trigger ROLLBACK
      }
      const answerQuery = `
        INSERT INTO student_quiz_answers (attempt_id, question_id, selected_option_id, answer_text, is_correct)
        VALUES ($1, $2, $3, $4, $5)
      `;
      // For a diagnostic quiz, 'is_correct' might be null or based on different logic
      // For simplicity, we'll set it to null for now.
      await client.query(answerQuery, [
        attemptId,
        answer.question_id,
        answer.selected_option_id || null, // Handle if not provided (e.g. for text answers)
        answer.answer_text || null,
        null // is_correct is not strictly applicable for all diagnostic questions
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
