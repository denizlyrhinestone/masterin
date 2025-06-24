const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { query, param, body, validationResult } = require('express-validator');
const { checkAndAwardCourseCompletionBadge } = require('../lib/gamificationService'); // Import badge service
const { getPublicS3Url, generatePresignedGetUrl, S3_BUCKET_NAME, s3Client } = require('../lib/s3Service'); // Import S3 utilities

// Helper function to update course aggregate review/like data
const updateCourseAggregates = async (courseId) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const reviewAggregates = await client.query(
      `SELECT COUNT(*) as total_ratings, AVG(rating) as average_rating
       FROM course_reviews WHERE course_id = $1`,
      [courseId]
    );
    const total_ratings = parseInt(reviewAggregates.rows[0].total_ratings, 10) || 0;
    const average_rating = parseFloat(reviewAggregates.rows[0].average_rating) || 0.00;

    const likeAggregates = await client.query(
      `SELECT COUNT(*) as total_likes FROM course_likes WHERE course_id = $1`,
      [courseId]
    );
    const total_likes = parseInt(likeAggregates.rows[0].total_likes, 10) || 0;

    await client.query(
      `UPDATE courses SET total_ratings = $1, average_rating = $2, total_likes = $3, updated_at = NOW()
       WHERE id = $4`,
      [total_ratings, average_rating.toFixed(2), total_likes, courseId]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error updating course aggregates for course ${courseId}:`, error.stack);
  } finally {
    client.release();
  }
};

// GET /api/courses (List Published Courses - for browsing)
router.get(
  '/',
  [
    query('subject').optional().trim().escape(),
    query('grade_level').optional().trim().escape(),
    query('language').optional().trim().escape(),
    query('search').optional().trim().escape(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { subject, grade_level, language, search } = req.query;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;
    let baseQuery = `
      SELECT c.id, c.title, c.description, c.subject, c.grade_level, c.language,
             c.estimated_duration_hours, c.thumbnail_image_url,
             c.average_rating, c.total_ratings, c.total_likes,
             u.email as instructor_email
      FROM courses c JOIN users u ON c.created_by = u.id
      WHERE c.is_publicly_browsable = TRUE AND c.review_status = 'published'`;
    const conditions = []; const queryParams = []; let paramIndex = 1;
    if (subject) { conditions.push(`c.subject ILIKE $${paramIndex++}`); queryParams.push(`%${subject}%`); }
    if (grade_level) { conditions.push(`c.grade_level ILIKE $${paramIndex++}`); queryParams.push(`%${grade_level}%`); }
    if (language) { conditions.push(`c.language = $${paramIndex++}`); queryParams.push(language); }
    if (search) { conditions.push(`(c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`); queryParams.push(`%${search}%`); paramIndex++; }
    if (conditions.length > 0) baseQuery += ' AND ' + conditions.join(' AND ');
    baseQuery += ` ORDER BY c.updated_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++};`;
    queryParams.push(limit, offset);
    try {
      const { rows: courses } = await db.query(baseQuery, queryParams);
      res.json(courses);
    } catch (error) { console.error(error.stack); res.status(500).json({ message: 'Server error fetching courses.' }); }
  }
);

// GET /api/courses/:courseId/view (Get Full Course Structure for Viewing)
router.get(
  '/:courseId/view',
  verifyToken,
  [param('courseId').isInt({ gt: 0 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { courseId } = req.params; const studentId = req.user.id;
    try {
      const courseQuery = `
        SELECT c.*, u.email as instructor_email
        FROM courses c JOIN users u ON c.created_by = u.id
        WHERE c.id = $1 AND c.review_status = 'published' AND
              (c.is_publicly_browsable = TRUE OR EXISTS (
                  SELECT 1 FROM student_progress sp
                  JOIN learning_pathways lp ON sp.learning_pathway_id = lp.id
                  WHERE sp.course_id = c.id AND lp.student_id = $2
              ));`;
      const courseResult = await db.query(courseQuery, [courseId, studentId]);
      if (courseResult.rows.length === 0) return res.status(404).json({ message: 'Course not found or not accessible.' });
      const course = courseResult.rows[0];
      const modulesResult = await db.query('SELECT id, title, description, order_index FROM course_modules WHERE course_id = $1 ORDER BY order_index ASC;', [courseId]);
      course.modules = modulesResult.rows;
      for (const module of course.modules) {
        const lessonsResult = await db.query('SELECT id, title, order_index FROM lessons WHERE module_id = $1 ORDER BY order_index ASC;', [module.id]);
        module.lessons = lessonsResult.rows;
        for (const lesson of module.lessons) {
          const blocksQuery = `
            SELECT id, content_type, order_index,
                   CASE
                     WHEN content_type = 'quiz_ref' THEN jsonb_build_object('quiz_id', content_data->'quiz_id', 'quiz_title', content_data->'quiz_title')
                     WHEN content_type = 'lab_ref' THEN jsonb_build_object('lab_id', content_data->'lab_id', 'lab_title', content_data->'lab_title')
                     WHEN content_type = 'video_embed' THEN jsonb_build_object('url', content_data->'url', 'caption', content_data->'caption')
                     WHEN content_type = 'text' THEN jsonb_build_object('preview', left(content_data->>'text', 100))
                     ELSE jsonb_build_object('type', content_type)
                   END as metadata
            FROM lesson_content_blocks WHERE lesson_id = $1 ORDER BY order_index ASC;`;
          const blocksResult = await db.query(blocksQuery, [lesson.id]);
          lesson.content_blocks_metadata = blocksResult.rows;
        }
      }
      res.json(course);
    } catch (error) { console.error(error.stack); res.status(500).json({ message: 'Server error fetching course view data.' }); }
  }
);

// GET /api/courses/:courseId/lessons/:lessonId/content-block/:blockId/details
router.get( '/:courseId/lessons/:lessonId/content-block/:blockId/details', verifyToken, [param('courseId').isInt({ gt: 0 }), param('lessonId').isInt({ gt: 0 }), param('blockId').isInt({ gt: 0 })], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { courseId, lessonId, blockId } = req.params; const studentId = req.user.id;
    let dbClient;
    try {
      dbClient = await db.pool.connect(); // Use explicit client

      // Updated courseAccess query to use student_progress directly
      const courseAccessQuery = `
        SELECT 1 FROM courses
        WHERE id = $1 AND review_status = 'published' AND
              (is_publicly_browsable = TRUE OR EXISTS (
                  SELECT 1 FROM student_progress sp
                  WHERE sp.course_id = $1 AND sp.student_id = $2
                    AND (sp.status = 'in-progress' OR sp.status = 'completed')
              ));`;
      const courseAccess = await dbClient.query(courseAccessQuery, [courseId, studentId]);

      if (courseAccess.rows.length === 0) return res.status(403).json({ message: "Access denied to this course content." });

      const blockRes = await dbClient.query(`SELECT lcb.content_type, lcb.content_data FROM lesson_content_blocks lcb JOIN lessons l ON lcb.lesson_id = l.id JOIN course_modules cm ON l.module_id = cm.id WHERE lcb.id = $1 AND lcb.lesson_id = $2 AND cm.course_id = $3;`, [blockId, lessonId, courseId]);
      if (blockRes.rows.length === 0) return res.status(404).json({ message: 'Content block not found.' });

      const block = blockRes.rows[0];
      let details = {};

      if (!s3Client || !S3_BUCKET_NAME) { // Check S3 configuration
        console.warn("S3 client not configured. File-based content blocks will not have URLs.");
      }

      switch (block.content_type) {
        case 'text':
        case 'ai_generated_text':
          details = { text: block.content_data.text };
          break;
        case 'video_embed':
          details = { url: block.content_data.url, caption: block.content_data.caption };
          break;
        case 'quiz_ref':
          const quizRes = await dbClient.query(`SELECT cq.id, cq.title, cq.description, COALESCE(json_agg(json_build_object('id', q.id, 'question_text', q.question_text, 'question_type', q.question_type, 'options', (SELECT COALESCE(json_agg(json_build_object('id', qo.id, 'option_text', qo.option_text)), '[]') FROM question_options qo WHERE qo.question_id = q.id))) FILTER (WHERE q.id IS NOT NULL), '[]') as questions FROM course_quizzes cq LEFT JOIN questions q ON q.course_quiz_id = cq.id WHERE cq.id = $1 GROUP BY cq.id;`, [block.content_data.quiz_id]);
          if (quizRes.rows.length === 0) return res.status(404).json({ message: 'Quiz not found.' });
          details = quizRes.rows[0];
          break;
        case 'video_upload':
        case 'slide_deck_upload': // Assuming PDFs or viewable formats for slides
          if (s3Client && S3_BUCKET_NAME && block.content_data.file_id) {
            const fileRes = await dbClient.query('SELECT file_name, file_path, mime_type FROM uploaded_files WHERE id = $1 AND upload_status = \'completed\';', [block.content_data.file_id]);
            if (fileRes.rows.length === 0) return res.status(404).json({ message: 'Uploaded file not found or not completed.' });
            const fileInfo = fileRes.rows[0];
            details = {
              ...fileInfo,
              view_url: await generatePresignedGetUrl(fileInfo.file_path, fileInfo.file_name, fileInfo.mime_type, 3600, true) // 1 hour, inline
            };
          } else {
            details = { error: "File content not available due to server configuration or missing file ID." };
          }
          break;
        case 'downloadable_ref':
          if (s3Client && S3_BUCKET_NAME && block.content_data.file_id) {
            const fileRes = await dbClient.query('SELECT file_name, file_path, mime_type FROM uploaded_files WHERE id = $1 AND upload_status = \'completed\';', [block.content_data.file_id]);
            if (fileRes.rows.length === 0) return res.status(404).json({ message: 'Downloadable file not found or not completed.' });
            const fileInfo = fileRes.rows[0];
            details = {
              ...fileInfo,
              download_url: await generatePresignedGetUrl(fileInfo.file_path, fileInfo.file_name, fileInfo.mime_type, 300, false) // 5 mins, attachment
            };
          } else {
             details = { error: "File content not available due to server configuration or missing file ID." };
          }
          break;
        case 'lab_ref':
          const labRes = await dbClient.query('SELECT * FROM labs_simulations WHERE id = $1;', [block.content_data.lab_id]);
          if (labRes.rows.length === 0) return res.status(404).json({ message: 'Lab not found.' });
          details = labRes.rows[0];
          break;
        default: return res.status(400).json({ message: 'Unsupported content type.' });
      }
      res.json({ content_type: block.content_type, details });
    } catch (error) {
      console.error('Error fetching content block details:', error.stack);
      res.status(500).json({ message: 'Server error fetching content block details.' });
    } finally {
      if (dbClient) dbClient.release();
    }
});

const { checkAndAwardCourseCompletionBadge } = require('../lib/gamificationService');

// POST /api/courses/:courseId/lessons/:lessonId/complete
router.post('/:courseId/lessons/:lessonId/complete', verifyToken, checkRole(['student']), [param('courseId').isInt({ gt: 0 }), param('lessonId').isInt({ gt: 0 })], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { courseId: courseIdParam, lessonId: lessonIdParam } = req.params;
    const courseId = parseInt(courseIdParam, 10);
    const lessonId = parseInt(lessonIdParam, 10);
    const studentId = req.user.id;
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      // Fetch student_progress directly using student_id and course_id
      const progressEntryResult = await client.query(
        `SELECT id as student_progress_id, status as current_status, completed_lessons_count, total_lessons_count, completed_lesson_ids
         FROM student_progress
         WHERE student_id = $1 AND course_id = $2`,
        [studentId, courseId]
      );

      if (progressEntryResult.rows.length === 0) {
        await client.query('ROLLBACK');
        // If no progress record, it implies the student hasn't started the course in a way that creates this record.
        // Depending on desired flow, could call ensureStudentProgressRecord here, or error out.
        // For now, error out, assuming ensureStudentProgressRecord is called on course enrollment/first view.
        return res.status(404).json({ message: 'Progress record not found for this course. Please start the course first.' });
      }

      const progressEntry = progressEntryResult.rows[0];
      const student_progress_id = progressEntry.student_progress_id;
      const initialProgressStatus = progressEntry.current_status;
      let completed_lessons_count = progressEntry.completed_lessons_count || 0; // This count is from student_progress
      let total_lessons_count = progressEntry.total_lessons_count || 0; // This is from student_progress
      let completed_lesson_ids = progressEntry.completed_lesson_ids || []; // Array of completed lesson IDs

      const lessonCheck = await client.query(
        `SELECT l.id FROM lessons l JOIN course_modules cm ON l.module_id = cm.id WHERE l.id = $1 AND cm.course_id = $2`,
        [lessonId, courseId]
      );
      if (lessonCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Lesson not found in this course.'});
      }

      // Logic to ensure total_lessons_count is accurate if not already set
      if (total_lessons_count === 0) {
        const courseLessonsCountRes = await client.query(`SELECT COUNT(l.id) as total_lessons FROM lessons l JOIN course_modules cm ON l.module_id = cm.id WHERE cm.course_id = $1`, [courseId]);
        total_lessons_count = parseInt(courseLessonsCountRes.rows[0].total_lessons, 10) || 0;
      }

      // This is a simplified "mark as complete". A real system might track individual lesson completion.
      // For now, we'll assume this endpoint just increments the count if not already at max.
      // A more robust approach would be to have a student_lesson_completions table.
      // We'll assume this endpoint is called once per unique lesson by the frontend for now.
      // To make it somewhat idempotent for course completion badge awarding:
      // Only increment if current_status is not 'completed'.
      // If the lesson is already "counted", this logic doesn't prevent re-incrementing.
      // A proper fix would be a separate table for lesson completions.
      // For now, the badge awarding check relies on the *course's* overall status.

      // Let's simulate a more direct "lesson completion" for the purpose of badge awarding:
      // Assume this call means the lesson is now "more complete" towards the total.
      // If this call makes the course complete, award badge.
      // The current logic for completed_lessons_count is just an increment which is not ideal.
      // For the badge logic to work based on course status, we need to ensure student_progress.status becomes 'completed'.

      // Refined logic:
      // If not using a student_lesson_progress table, we check if this lesson was already "counted".
      // This requires a way to know which lessons are completed. For now, we stick to the existing model.
      // The current model increments completed_lessons_count. If it reaches total, status becomes 'completed'.
      // This needs to be more robust by using the completed_lesson_ids array.

      let new_completed_lesson_ids = [...completed_lesson_ids];
      let lessonAddedToCompletion = false;

      if (!completed_lesson_ids.includes(lessonId)) {
        new_completed_lesson_ids.push(lessonId);
        lessonAddedToCompletion = true;
      }

      const updated_completed_lessons_count = new_completed_lesson_ids.length;

      const new_progress_percentage = total_lessons_count > 0 ? Math.round((updated_completed_lessons_count / total_lessons_count) * 100) : 0;
      let new_status = progressEntry.current_status; // Keep current status unless changed below

      if (lessonAddedToCompletion || initialProgressStatus === 'not-started') {
        new_status = (updated_completed_lessons_count === total_lessons_count && total_lessons_count > 0) ? 'completed' : 'in-progress';
      }

      const updateResult = await client.query(
        `UPDATE student_progress
         SET completed_lessons_count = $1, total_lessons_count = $2, progress_percentage = $3, status = $4,
             completed_lesson_ids = $5, last_accessed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $6 RETURNING *`,
        [updated_completed_lessons_count, total_lessons_count, new_progress_percentage, new_status, new_completed_lesson_ids, student_progress_id]
      );

      if (updateResult.rowCount === 0) throw new Error("Failed to update progress.");
      const updatedProgress = updateResult.rows[0];

      if (updatedProgress.status === 'completed' && initialProgressStatus !== 'completed') {
          await checkAndAwardCourseCompletionBadge(studentId, courseId, client);
      }

      await client.query('COMMIT');
      res.status(200).json({ message: 'Lesson progress updated.', progress: updatedProgress });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error marking lesson complete/updating progress:', error.stack);
      res.status(500).json({ message: 'Server error updating lesson progress.' });
    } finally {
      client.release();
    }
});

// POST /api/courses/:courseId/quizzes/:courseQuizId/submit
router.post('/:courseId/quizzes/:courseQuizId/submit', verifyToken, checkRole(['student']), [param('courseId').isInt({ gt: 0 }), param('courseQuizId').isInt({ gt: 0 }), body('answers').isArray({min:1}), body('answers.*.question_id').isInt({gt:0}), body('answers.*.selected_option_id').optional({nullable:true}).isInt({gt:0}), body('answers.*.answer_text').optional({nullable:true}).isString().trim().escape()], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({errors: errors.array()});
    const { courseId, courseQuizId } = req.params; const studentId = req.user.id; const studentAnswers = req.body.answers;
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const quizMeta = await client.query('SELECT id FROM course_quizzes WHERE id = $1 AND (course_id = $2 OR course_id IS NULL)', [courseQuizId, courseId]);
      if(quizMeta.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({message: 'Quiz not found.'}); }
      const cAnswersRes = await client.query(`SELECT q.id as question_id, qo.id as correct_option_id, q.question_type FROM questions q LEFT JOIN question_options qo ON q.id = qo.question_id AND qo.is_correct = TRUE WHERE q.course_quiz_id = $1;`, [courseQuizId]);
      const cAnswersMap = new Map(); cAnswersRes.rows.forEach(r => cAnswersMap.set(r.question_id, r));
      let score = 0; const results = [];
      for(const ans of studentAnswers){
        const cAns = cAnswersMap.get(ans.question_id); let is_correct = false;
        if(cAns && cAns.question_type === 'multiple-choice' && cAns.correct_option_id === ans.selected_option_id) is_correct = true;
        if(is_correct) score++;
        results.push({ question_id: ans.question_id, selected_option_id: ans.selected_option_id, answer_text: ans.answer_text, is_correct: is_correct });
      }
      const totalQ = cAnswersMap.size; const percScore = totalQ > 0 ? Math.round((score/totalQ)*100) : 0;
      const attRes = await client.query(`INSERT INTO student_quiz_attempts (student_id, quiz_identifier, quiz_type, score, completed_at) VALUES ($1, $2, 'course', $3, CURRENT_TIMESTAMP) RETURNING id;`, [studentId, courseQuizId.toString(), percScore]);
      const attId = attRes.rows[0].id;
      for(const r of results) { await client.query(`INSERT INTO student_quiz_answers (attempt_id, question_id, selected_option_id, answer_text, is_correct) VALUES ($1, $2, $3, $4, $5);`, [attId, r.question_id, r.selected_option_id || null, r.answer_text || null, r.is_correct]); }
      await client.query('COMMIT');
      res.status(201).json({ message: 'Quiz submitted.', attempt_id: attId, score: percScore, total_questions: totalQ, correct_answers: score, results: results.map(r=>({qid:r.question_id, correct:r.is_correct})) });
    } catch (error) { await client.query('ROLLBACK'); console.error(error.stack); res.status(500).json({message: 'Server error.'});
    } finally { client.release(); }
});

// --- Course Reviews & Likes ---
router.post('/:courseId/reviews', verifyToken, checkRole(['student']), [param('courseId').isInt({ gt: 0 }), body('rating').isInt({ min: 1, max: 5 }), body('comment').optional({ checkFalsy: true }).trim().escape()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { courseId } = req.params; const { rating, comment } = req.body; const userId = req.user.id;
  try {
    const { rows: [review] } = await db.query(`INSERT INTO course_reviews (course_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) ON CONFLICT (course_id, user_id) DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, updated_at = NOW() RETURNING *;`, [courseId, userId, rating, comment]);
    await updateCourseAggregates(courseId);
    res.status(201).json(review);
  } catch (error) { console.error(error.stack); res.status(500).json({ message: 'Server error posting review.' }); }
});

router.get('/:courseId/reviews', [param('courseId').isInt({ gt: 0 }), query('page').optional().isInt({ min: 1 }).toInt(), query('limit').optional().isInt({ min: 1, max: 50 }).toInt()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { courseId } = req.params; const page = req.query.page || 1; const limit = req.query.limit || 10; const offset = (page - 1) * limit;
  try {
    const { rows: reviews } = await db.query(`SELECT cr.id, cr.rating, cr.comment, cr.created_at, cr.updated_at, u.id as user_id, u.email as user_email FROM course_reviews cr JOIN users u ON cr.user_id = u.id WHERE cr.course_id = $1 ORDER BY cr.updated_at DESC LIMIT $2 OFFSET $3;`, [courseId, limit, offset]);
    res.json(reviews);
  } catch (error) { console.error(error.stack); res.status(500).json({ message: 'Server error fetching reviews.' }); }
});

router.delete('/:courseId/reviews/:reviewId', verifyToken, [param('courseId').isInt({ gt: 0 }), param('reviewId').isInt({ gt: 0 })], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { courseId, reviewId } = req.params; const userId = req.user.id; const userRole = req.user.role;
  try {
    let queryParams = userRole === 'admin' ? [reviewId, courseId] : [reviewId, courseId, userId];
    let queryText = userRole === 'admin' ? 'DELETE FROM course_reviews WHERE id = $1 AND course_id = $2 RETURNING id;' : 'DELETE FROM course_reviews WHERE id = $1 AND course_id = $2 AND user_id = $3 RETURNING id;';
    const result = await db.query(queryText, queryParams);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Review not found or not authorized.' });
    await updateCourseAggregates(courseId);
    res.status(200).json({ message: 'Review deleted.' });
  } catch (error) { console.error(error.stack); res.status(500).json({ message: 'Server error deleting review.' }); }
});

router.post('/:courseId/like', verifyToken, checkRole(['student']), [param('courseId').isInt({ gt: 0 })], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { courseId } = req.params; const userId = req.user.id;
  try {
    const likeCheck = await db.query('SELECT * FROM course_likes WHERE course_id = $1 AND user_id = $2', [courseId, userId]);
    let liked = false;
    if (likeCheck.rows.length > 0) { await db.query('DELETE FROM course_likes WHERE course_id = $1 AND user_id = $2', [courseId, userId]); liked = false;
    } else { await db.query('INSERT INTO course_likes (course_id, user_id) VALUES ($1, $2)', [courseId, userId]); liked = true; }
    await updateCourseAggregates(courseId);
    const course = await db.query('SELECT total_likes FROM courses WHERE id = $1', [courseId]);
    res.json({ liked, total_likes: course.rows[0].total_likes });
  } catch (error) { console.error(error.stack); res.status(500).json({ message: 'Server error liking/unliking course.' }); }
});

router.get('/:courseId/like-status', verifyToken, checkRole(['student']), [param('courseId').isInt({ gt: 0 })], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { courseId } = req.params; const userId = req.user.id;
  try {
    const result = await db.query('SELECT 1 FROM course_likes WHERE course_id = $1 AND user_id = $2', [courseId, userId]);
    res.json({ liked: result.rows.length > 0 });
  } catch (error) { console.error(error.stack); res.status(500).json({ message: 'Server error fetching like status.' }); }
});

module.exports = router;
