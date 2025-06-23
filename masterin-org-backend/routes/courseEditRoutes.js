const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { body, param, validationResult } = require('express-validator');

// Middleware to check course ownership or admin role
const checkCourseOwnershipOrAdmin = async (req, res, next) => {
  try {
    const courseIdParam = req.params.courseId || req.params.id; // For routes like /:courseId/...
    // Ensure courseId is an integer before querying
    const courseId = parseInt(courseIdParam, 10);
    if (isNaN(courseId)) {
        // If courseId is not available in params (e.g. on POST /api/courses for create), skip direct ownership check here.
        // The checkRole middleware handles teacher/admin role for creation.
        // For specific resource actions like adding a module, courseId will be a param.
        if (req.method === 'POST' && (req.path === '/' || req.path.endsWith('/modules') || req.path.includes('/lessons') || req.path.includes('/blocks') )) {
            // Allow create operations if role is sufficient, specific courseId check for sub-resources will use params.
             if (req.params.courseId) { // If courseId is in params, it must be valid for sub-resources
                // proceed to fetch and check
             } else {
                return next(); // For top-level POST /courses, ownership doesn't apply yet.
             }
        } else if (!courseIdParam) { // If courseId is expected but not found in params for other methods
             return res.status(400).json({ message: 'Course ID is required for this operation.' });
        } else { // If courseIdParam exists but is not a number
            return res.status(400).json({ message: 'Invalid Course ID format in URL parameter.' });
        }
    }

    if (courseId) { // Only proceed if courseId is valid and present (for sub-resource checks or specific course actions)
        const courseResult = await db.query('SELECT id, created_by FROM courses WHERE id = $1', [courseId]);
        if (courseResult.rows.length === 0) {
          return res.status(404).json({ message: 'Course not found.' });
        }
        const course = courseResult.rows[0];
        req.course = course; // Attach course to request for later use if needed

        if (req.user.role === 'admin' || course.created_by === req.user.id) {
          return next();
        } else {
          return res.status(403).json({ message: 'Forbidden: You do not own this course or lack admin privileges.' });
        }
    } else { // If courseId wasn't required for this specific check path (e.g. POST /courses)
        return next();
    }

  } catch (error) {
    console.error('Error in checkCourseOwnershipOrAdmin:', error.stack);
    return res.status(500).json({ message: 'Server error during ownership check.' });
  }
};


// --- Courses ---
router.post(
  '/',
  verifyToken,
  checkRole(['teacher', 'admin']),
  [
    body('title').notEmpty().trim().escape().withMessage('Title is required.'),
    body('description').optional({ checkFalsy: true }).trim().escape(),
    body('subject').optional({ checkFalsy: true }).trim().escape(),
    body('grade_level').optional({ checkFalsy: true }).trim().escape(),
    body('language').optional().trim().escape().isLength({ min: 2, max: 10 }).withMessage('Language code invalid.'),
    body('estimated_duration_hours').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Estimated duration must be a non-negative integer.'),
    body('thumbnail_image_url').optional({ checkFalsy: true }).isURL().withMessage('Thumbnail URL must be a valid URL.'),
    body('is_publicly_browsable').optional().isBoolean().withMessage('is_publicly_browsable must be a boolean.'),
    body('is_template').optional().isBoolean().withMessage('is_template must be a boolean.'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { title, description, subject, grade_level, language, estimated_duration_hours, thumbnail_image_url, is_publicly_browsable, is_template } = req.body;
    const created_by = req.user.id;
    try {
      const query = `INSERT INTO courses (title, description, subject, grade_level, language, estimated_duration_hours, thumbnail_image_url, is_publicly_browsable, is_template, created_by, review_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;`;
      const values = [title, description, subject, grade_level, language || 'en', estimated_duration_hours || null, thumbnail_image_url || null, is_publicly_browsable === undefined ? true : is_publicly_browsable, is_template === undefined ? false : is_template, created_by, 'draft'];
      const { rows: [newCourse] } = await db.query(query, values);
      res.status(201).json(newCourse);
    } catch (error) { console.error('Error creating course:', error.stack); res.status(500).json({ message: 'Server error creating course.' }); }
  }
);
router.get('/my-courses', verifyToken, checkRole(['teacher', 'admin']), async (req, res) => {
  try {
    const { rows: courses } = await db.query('SELECT * FROM courses WHERE created_by = $1 ORDER BY updated_at DESC;', [req.user.id]);
    res.json(courses);
  } catch (error) { console.error("Error fetching user's courses:", error.stack); res.status(500).json({ message: "Server error fetching user's courses." }); }
});
router.get('/:courseId/edit', verifyToken, [param('courseId').isInt({ gt: 0 })], checkCourseOwnershipOrAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { courseId } = req.params;
  try {
    const course = req.course; // Attached by checkCourseOwnershipOrAdmin
    const modulesResult = await db.query('SELECT * FROM course_modules WHERE course_id = $1 ORDER BY order_index ASC;', [courseId]);
    course.modules = modulesResult.rows;
    for (const module of course.modules) {
      const lessonsResult = await db.query('SELECT * FROM lessons WHERE module_id = $1 ORDER BY order_index ASC;', [module.id]);
      module.lessons = lessonsResult.rows;
      for (const lesson of module.lessons) {
        const blocksResult = await db.query('SELECT * FROM lesson_content_blocks WHERE lesson_id = $1 ORDER BY order_index ASC;', [lesson.id]);
        lesson.content_blocks = blocksResult.rows;
      }
    }
    res.json(course);
  } catch (error) { console.error('Error fetching course for editing:', error.stack); res.status(500).json({ message: 'Server error fetching course structure.' }); }
});
router.put('/:courseId', verifyToken, [param('courseId').isInt({ gt: 0 }), body('title').optional().notEmpty().trim().escape(), body('description').optional({ checkFalsy: true }).trim().escape(), body('subject').optional({ checkFalsy: true }).trim().escape(), body('grade_level').optional({ checkFalsy: true }).trim().escape(), body('language').optional({ checkFalsy: true }).trim().escape().isLength({ min: 2, max: 10 }), body('estimated_duration_hours').optional({ checkFalsy: true }).isInt({ min: 0 }), body('thumbnail_image_url').optional({ checkFalsy: true }).isURL(), body('is_publicly_browsable').optional().isBoolean(), body('is_template').optional().isBoolean(), body('review_status').optional().isIn(['draft', 'pending_review', 'peer_reviewed', 'admin_reviewed', 'published', 'rejected'])], checkCourseOwnershipOrAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { courseId } = req.params;
  try {
    const updates = []; const values = []; let valueIndex = 1;
    const fields = ['title', 'description', 'subject', 'grade_level', 'language', 'estimated_duration_hours', 'thumbnail_image_url', 'is_publicly_browsable', 'is_template', 'review_status'];
    fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = $${valueIndex++}`); values.push(req.body[f]); } });
    if (updates.length === 0) return res.status(400).json({ message: 'No fields for update.' });
    updates.push(`updated_at = CURRENT_TIMESTAMP`); values.push(courseId);
    const { rows: [updatedCourse] } = await db.query(`UPDATE courses SET ${updates.join(', ')} WHERE id = $${valueIndex} RETURNING *;`, values);
    res.json(updatedCourse);
  } catch (error) { console.error('Error updating course:', error.stack); res.status(500).json({ message: 'Server error updating course.' }); }
});
router.delete('/:courseId', verifyToken, [param('courseId').isInt({ gt: 0 })], checkCourseOwnershipOrAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try { await db.query('DELETE FROM courses WHERE id = $1', [req.params.courseId]); res.status(200).json({ message: 'Course deleted.' });
  } catch (error) { console.error('Error deleting course:', error.stack); res.status(500).json({ message: 'Server error.' }); }
});

// --- Course Modules ---
router.post('/:courseId/modules', verifyToken, [param('courseId').isInt({ gt: 0 }), body('title').notEmpty().trim().escape(), body('description').optional({ checkFalsy: true }).trim().escape(), body('order_index').optional().isInt({ min: 0 })], checkCourseOwnershipOrAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { courseId } = req.params; const { title, description, order_index } = req.body;
  try {
    const { rows: [newModule] } = await db.query(`INSERT INTO course_modules (course_id, title, description, order_index) VALUES ($1, $2, $3, $4) RETURNING *;`, [courseId, title, description, order_index === undefined ? 0 : order_index]);
    res.status(201).json(newModule);
  } catch (error) { console.error('Error creating module:', error.stack); res.status(500).json({ message: 'Server error.' }); }
});
router.put('/:courseId/modules/:moduleId', verifyToken, [param('courseId').isInt({ gt: 0 }), param('moduleId').isInt({ gt: 0 }), body('title').optional().notEmpty().trim().escape(), body('description').optional({ checkFalsy: true }).trim().escape(), body('order_index').optional().isInt({ min: 0 })], checkCourseOwnershipOrAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { courseId, moduleId } = req.params;
  try {
    const moduleCheck = await db.query('SELECT id FROM course_modules WHERE id = $1 AND course_id = $2', [moduleId, courseId]);
    if (moduleCheck.rows.length === 0) return res.status(404).json({ message: 'Module not found.' });
    const updates = []; const values = []; let valueIndex = 1;
    if (req.body.title !== undefined) { updates.push(`title = $${valueIndex++}`); values.push(req.body.title); }
    if (req.body.description !== undefined) { updates.push(`description = $${valueIndex++}`); values.push(req.body.description); }
    if (req.body.order_index !== undefined) { updates.push(`order_index = $${valueIndex++}`); values.push(req.body.order_index); }
    if (updates.length === 0) return res.status(400).json({ message: 'No fields to update.' });
    updates.push(`updated_at = CURRENT_TIMESTAMP`); values.push(moduleId, courseId);
    const { rows: [updatedModule] } = await db.query(`UPDATE course_modules SET ${updates.join(', ')} WHERE id = $${valueIndex++} AND course_id = $${valueIndex++} RETURNING *;`, values);
    res.json(updatedModule);
  } catch (error) { console.error('Error updating module:', error.stack); res.status(500).json({ message: 'Server error.' }); }
});
router.delete('/:courseId/modules/:moduleId', verifyToken, [param('courseId').isInt({ gt: 0 }), param('moduleId').isInt({ gt: 0 })], checkCourseOwnershipOrAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { courseId, moduleId } = req.params;
  try {
    const result = await db.query('DELETE FROM course_modules WHERE id = $1 AND course_id = $2 RETURNING id', [moduleId, courseId]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Module not found.' });
    res.status(200).json({ message: 'Module deleted.' });
  } catch (error) { console.error('Error deleting module:', error.stack); res.status(500).json({ message: 'Server error.' }); }
});

// --- Lessons ---
router.post('/:courseId/modules/:moduleId/lessons', verifyToken, [param('courseId').isInt({ gt: 0 }), param('moduleId').isInt({ gt: 0 }), body('title').notEmpty().trim().escape(), body('order_index').optional().isInt({ min: 0 })], checkCourseOwnershipOrAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { courseId, moduleId } = req.params; const { title, order_index } = req.body;
  try {
    const moduleCheck = await db.query('SELECT id FROM course_modules WHERE id = $1 AND course_id = $2', [moduleId, courseId]);
    if (moduleCheck.rows.length === 0) return res.status(404).json({ message: 'Module not found.' });
    const { rows: [newLesson] } = await db.query(`INSERT INTO lessons (module_id, title, order_index) VALUES ($1, $2, $3) RETURNING *;`, [moduleId, title, order_index === undefined ? 0 : order_index]);
    res.status(201).json(newLesson);
  } catch (error) { console.error('Error creating lesson:', error.stack); res.status(500).json({ message: 'Server error.' }); }
});
router.put('/:courseId/modules/:moduleId/lessons/:lessonId', verifyToken, [param('courseId').isInt({ gt: 0 }), param('moduleId').isInt({ gt: 0 }), param('lessonId').isInt({ gt: 0 }), body('title').optional().notEmpty().trim().escape(), body('order_index').optional().isInt({ min: 0 })], checkCourseOwnershipOrAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { courseId, moduleId, lessonId } = req.params;
  try {
    const lessonCheck = await db.query('SELECT l.id FROM lessons l JOIN course_modules cm ON l.module_id = cm.id WHERE l.id = $1 AND l.module_id = $2 AND cm.course_id = $3', [lessonId, moduleId, courseId]);
    if (lessonCheck.rows.length === 0) return res.status(404).json({ message: 'Lesson not found.' });
    const updates = []; const values = []; let valueIndex = 1;
    if (req.body.title !== undefined) { updates.push(`title = $${valueIndex++}`); values.push(req.body.title); }
    if (req.body.order_index !== undefined) { updates.push(`order_index = $${valueIndex++}`); values.push(req.body.order_index); }
    if (updates.length === 0) return res.status(400).json({ message: 'No fields to update.' });
    updates.push(`updated_at = CURRENT_TIMESTAMP`); values.push(lessonId, moduleId);
    const { rows: [updatedLesson] } = await db.query(`UPDATE lessons SET ${updates.join(', ')} WHERE id = $${valueIndex++} AND module_id = $${valueIndex++} RETURNING *;`, values);
    res.json(updatedLesson);
  } catch (error) { console.error('Error updating lesson:', error.stack); res.status(500).json({ message: 'Server error.' }); }
});
router.delete('/:courseId/modules/:moduleId/lessons/:lessonId', verifyToken, [param('courseId').isInt({ gt: 0 }), param('moduleId').isInt({ gt: 0 }), param('lessonId').isInt({ gt: 0 })], checkCourseOwnershipOrAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { courseId, moduleId, lessonId } = req.params;
  try {
    const lessonCheck = await db.query('SELECT l.id FROM lessons l JOIN course_modules cm ON l.module_id = cm.id WHERE l.id = $1 AND l.module_id = $2 AND cm.course_id = $3', [lessonId, moduleId, courseId]);
    if (lessonCheck.rows.length === 0) return res.status(404).json({ message: 'Lesson not found.' });
    await db.query('DELETE FROM lessons WHERE id = $1', [lessonId]);
    res.status(200).json({ message: 'Lesson deleted.' });
  } catch (error) { console.error('Error deleting lesson:', error.stack); res.status(500).json({ message: 'Server error.' }); }
});

// --- Lesson Content Blocks ---
const contentBlockValidation = [ body('content_type').isIn(['text', 'video_embed', 'video_upload', 'slide_deck_embed', 'slide_deck_upload', 'quiz_ref', 'lab_ref', 'downloadable_ref', 'ai_generated_text']).withMessage('Invalid content type.'), body('content_data').isJSON().withMessage('Content data must be valid JSON.'), body('order_index').optional().isInt({ min: 0 }).withMessage('Order index must be non-negative.') ];
router.post('/:courseId/modules/:moduleId/lessons/:lessonId/blocks', verifyToken, [param('courseId').isInt({ gt: 0 }), param('moduleId').isInt({ gt: 0 }), param('lessonId').isInt({ gt: 0 }), ...contentBlockValidation], checkCourseOwnershipOrAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { courseId, moduleId, lessonId } = req.params; const { content_type, content_data, order_index } = req.body;
  try {
    const lessonCheck = await db.query('SELECT l.id FROM lessons l JOIN course_modules cm ON l.module_id = cm.id WHERE l.id = $1 AND l.module_id = $2 AND cm.course_id = $3', [lessonId, moduleId, courseId]);
    if (lessonCheck.rows.length === 0) return res.status(404).json({ message: 'Lesson not found.' });
    const { rows: [newBlock] } = await db.query(`INSERT INTO lesson_content_blocks (lesson_id, content_type, content_data, order_index) VALUES ($1, $2, $3, $4) RETURNING *;`, [lessonId, content_type, content_data, order_index === undefined ? 0 : order_index]);
    res.status(201).json(newBlock);
  } catch (error) { console.error('Error creating block:', error.stack); res.status(500).json({ message: 'Server error.' }); }
});
router.put('/:courseId/modules/:moduleId/lessons/:lessonId/blocks/:blockId', verifyToken, [param('courseId').isInt({ gt: 0 }), param('moduleId').isInt({ gt: 0 }), param('lessonId').isInt({ gt: 0 }), param('blockId').isInt({ gt: 0 }), body('content_type').optional().isIn(['text', 'video_embed', 'video_upload', 'slide_deck_embed', 'slide_deck_upload', 'quiz_ref', 'lab_ref', 'downloadable_ref', 'ai_generated_text']), body('content_data').optional().isJSON(), body('order_index').optional().isInt({ min: 0 })], checkCourseOwnershipOrAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { courseId, moduleId, lessonId, blockId } = req.params;
  try {
    const blockCheck = await db.query('SELECT lcb.id FROM lesson_content_blocks lcb JOIN lessons l ON lcb.lesson_id = l.id JOIN course_modules cm ON l.module_id = cm.id WHERE lcb.id = $1 AND lcb.lesson_id = $2 AND l.module_id = $3 AND cm.course_id = $4', [blockId, lessonId, moduleId, courseId]);
    if (blockCheck.rows.length === 0) return res.status(404).json({ message: 'Block not found.' });
    const updates = []; const values = []; let valueIndex = 1;
    if (req.body.content_type !== undefined) { updates.push(`content_type = $${valueIndex++}`); values.push(req.body.content_type); }
    if (req.body.content_data !== undefined) { updates.push(`content_data = $${valueIndex++}`); values.push(req.body.content_data); }
    if (req.body.order_index !== undefined) { updates.push(`order_index = $${valueIndex++}`); values.push(req.body.order_index); }
    if (updates.length === 0) return res.status(400).json({ message: 'No fields to update.' });
    updates.push(`updated_at = CURRENT_TIMESTAMP`); values.push(blockId);
    const { rows: [updatedBlock] } = await db.query(`UPDATE lesson_content_blocks SET ${updates.join(', ')} WHERE id = $${valueIndex++} RETURNING *;`, values);
    res.json(updatedBlock);
  } catch (error) { console.error('Error updating block:', error.stack); res.status(500).json({ message: 'Server error.' }); }
});
router.delete('/:courseId/modules/:moduleId/lessons/:lessonId/blocks/:blockId', verifyToken, [param('courseId').isInt({ gt: 0 }), param('moduleId').isInt({ gt: 0 }), param('lessonId').isInt({ gt: 0 }), param('blockId').isInt({ gt: 0 })], checkCourseOwnershipOrAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { courseId, moduleId, lessonId, blockId } = req.params;
  try {
    const blockCheck = await db.query('SELECT lcb.id FROM lesson_content_blocks lcb JOIN lessons l ON lcb.lesson_id = l.id JOIN course_modules cm ON l.module_id = cm.id WHERE lcb.id = $1 AND lcb.lesson_id = $2 AND l.module_id = $3 AND cm.course_id = $4', [blockId, lessonId, moduleId, courseId]);
    if (blockCheck.rows.length === 0) return res.status(404).json({ message: 'Block not found.' });
    await db.query('DELETE FROM lesson_content_blocks WHERE id = $1', [blockId]);
    res.status(200).json({ message: 'Block deleted.' });
  } catch (error) { console.error('Error deleting block:', error.stack); res.status(500).json({ message: 'Server error.' }); }
});
router.post('/:courseId/modules/:moduleId/lessons/:lessonId/blocks/reorder', verifyToken, [param('courseId').isInt({ gt: 0 }), param('moduleId').isInt({ gt: 0 }), param('lessonId').isInt({ gt: 0 }), body().isArray().withMessage('Body must be an array.'), body('*.blockId').isInt({ gt: 0 }), body('*.order_index').isInt({ min: 0 })], checkCourseOwnershipOrAdmin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { courseId, moduleId, lessonId } = req.params; const blocksOrder = req.body;
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const lessonCheck = await client.query('SELECT l.id FROM lessons l JOIN course_modules cm ON l.module_id = cm.id WHERE l.id = $1 AND l.module_id = $2 AND cm.course_id = $3', [lessonId, moduleId, courseId]);
    if (lessonCheck.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ message: 'Lesson not found.' }); }
    for (const item of blocksOrder) { await client.query('UPDATE lesson_content_blocks SET order_index = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND lesson_id = $3', [item.order_index, item.blockId, lessonId]); }
    await client.query('COMMIT');
    res.status(200).json({ message: 'Blocks reordered.' });
  } catch (error) { await client.query('ROLLBACK'); console.error('Error reordering blocks:', error.stack); res.status(500).json({ message: 'Server error.' });
  } finally { client.release(); }
});

// --- File Upload Metadata ---
// These endpoints handle metadata. Actual file stream uploads would be separate.

// POST /api/files/initiate-upload (Initiate File Upload)
router.post(
  '/files/initiate-upload', // Note: This is not nested under courses, it's a general utility
  verifyToken, // Any authenticated user can initiate an upload for their own use
  [
    body('file_name').notEmpty().trim().escape().withMessage('File name is required.'),
    body('mime_type').notEmpty().trim().escape().withMessage('MIME type is required.'),
    body('size_bytes').optional().isInt({ min: 0 }).withMessage('Size must be a non-negative integer.'),
    // 'context' could be used to tag where the file is intended (e.g. course_material, profile_pic)
    // body('context').optional().trim().escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { file_name, mime_type, size_bytes /*, context */ } = req.body;
    const uploader_user_id = req.user.id;

    // Generate a unique file_path or structure. This is highly dependent on storage strategy.
    // For now, a placeholder. In a real system, this could involve UUIDs, user IDs, dates etc.
    // Example: user_<userId>/<timestamp>_<fileName>
    const generated_file_path = `user_${uploader_user_id}/${Date.now()}_${file_name.replace(/\s+/g, '_')}`;
    const storage_details = { service: "local_placeholder", path_prefix: "uploads/" }; // Example

    try {
      const query = `
        INSERT INTO uploaded_files (uploader_user_id, file_name, file_path, mime_type, size_bytes, upload_status, storage_details)
        VALUES ($1, $2, $3, $4, $5, 'pending', $6)
        RETURNING id, file_path, upload_status;
        -- Return ID and path; frontend might need path/presigned URL for actual upload
      `;
      const values = [uploader_user_id, file_name, generated_file_path, mime_type, size_bytes || null, JSON.stringify(storage_details)];
      const { rows: [newFileRecord] } = await db.query(query, values);

      // In a real scenario with cloud storage, generate and return a pre-signed URL here
      // For local, the `file_path` might be used by a subsequent streaming upload endpoint.
      res.status(201).json({
        message: "File upload initiated. Record created.",
        file_id: newFileRecord.id,
        // For client-side uploads to S3 etc., you'd return a preSignedUrl: presignedUrl
        // For server-side streaming, you might just return the file_id and expect a stream to an endpoint like /api/files/:fileId/stream
        upload_path_info: newFileRecord.file_path, // Example, depends on strategy
        current_status: newFileRecord.upload_status
      });
    } catch (error) {
      console.error('Error initiating file upload:', error.stack);
      res.status(500).json({ message: 'Server error initiating file upload.' });
    }
  }
);

// POST /api/courses/course-quizzes/:courseQuizId/questions
router.post(
  '/course-quizzes/:courseQuizId/questions',
  verifyToken,
  checkRole(['teacher', 'admin']),
  [
    param('courseQuizId').isInt({ gt: 0 }).withMessage('Course Quiz ID must be an integer.'),
    body('question_text').trim().notEmpty().withMessage('Question text is required.'),
    body('question_type').isIn(['multiple-choice', 'true-false', 'short-answer']).withMessage('Invalid question type.'),
    body('options').isArray({ min: 1 }).withMessage('At least one option is required, usually 2-4 for multiple-choice/true-false.'), // Min 1 for short answer placeholder if needed
    body('options.*.text').trim().notEmpty().withMessage('Option text is required.'),
    body('options.*.is_correct').isBoolean().withMessage('is_correct must be a boolean for each option.'),
    body('options.*.label').optional().trim().escape(), // Optional label like A, B, C, D
    body('options').custom((options, { req }) => {
      if (req.body.question_type === 'multiple-choice') {
        if (options.length < 2) throw new Error('Multiple-choice questions require at least 2 options.');
        const correctOptions = options.filter(opt => opt.is_correct === true || String(opt.is_correct) === 'true');
        if (correctOptions.length !== 1) {
          throw new Error('Exactly one option must be marked as correct for multiple-choice questions.');
        }
      } else if (req.body.question_type === 'true-false') {
        if (options.length !== 2) throw new Error('True/False questions require exactly two options.');
        const correctOptions = options.filter(opt => opt.is_correct === true || String(opt.is_correct) === 'true');
        if (correctOptions.length !== 1) {
          throw new Error('Exactly one option must be marked as correct for true/false questions.');
        }
      }
      // No specific option validation for 'short-answer', options might be used for keywords or be an empty array.
      return true;
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { courseQuizId } = req.params;
    const { question_text, question_type, options } = req.body;
    const userId = req.user.id;

    let client;
    try {
      client = await db.pool.connect(); // Use db.pool.connect()

      // 1. Verify quiz exists and user has permission
      const quizResult = await client.query(
        'SELECT id, created_by_user_id FROM course_quizzes WHERE id = $1',
        [courseQuizId]
      );

      if (quizResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Course quiz not found.' });
      }

      const quiz = quizResult.rows[0];
      if (quiz.created_by_user_id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'You are not authorized to add questions to this quiz.' });
      }

      await client.query('BEGIN');

      // 2. Insert into questions table
      const questionInsertResult = await client.query(
        `INSERT INTO questions (question_text, question_type, course_quiz_id)
         VALUES ($1, $2, $3) RETURNING id, question_text, question_type, course_quiz_id`,
        [question_text, question_type, courseQuizId]
      );
      const newQuestion = questionInsertResult.rows[0];

      // 3. Insert into question_options table
      const createdOptions = [];
      for (const option of options) {
        const optionInsertResult = await client.query(
          `INSERT INTO question_options (question_id, option_text, is_correct, label)
           VALUES ($1, $2, $3, $4) RETURNING id, option_text, is_correct, label`,
          [newQuestion.id, option.text, option.is_correct, option.label || null]
        );
        createdOptions.push(optionInsertResult.rows[0]);
      }

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Question added successfully to the quiz.',
        question: {
          ...newQuestion,
          options: createdOptions
        }
      });

    } catch (error) {
      if (client) await client.query('ROLLBACK');
      console.error('Error adding question to quiz:', error);
      res.status(500).json({ success: false, message: 'Server error while adding question.' });
    } finally {
      if (client) client.release();
    }
  }
);

// POST /api/files/:fileId/complete-upload (Confirm Upload)
router.post(
  '/files/:fileId/complete-upload',
  verifyToken,
  [
    param('fileId').isInt({ gt: 0 }).withMessage('File ID must be a positive integer.'),
    body('upload_status').isIn(['completed', 'error']).withMessage("Status must be 'completed' or 'error'.")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { fileId } = req.params;
    const { upload_status, storage_details_update } = req.body; // Optional: new storage details if they changed
    const uploader_user_id = req.user.id;

    try {
      // Verify user owns the file record or is admin
      const fileCheck = await db.query('SELECT id, storage_details FROM uploaded_files WHERE id = $1 AND uploader_user_id = $2', [fileId, uploader_user_id]);
      if (fileCheck.rows.length === 0) {
        return res.status(404).json({ message: 'File record not found or not owned by user.' });
      }

      const currentStorageDetails = fileCheck.rows[0].storage_details;
      const finalStorageDetails = storage_details_update ? JSON.stringify(storage_details_update) : JSON.stringify(currentStorageDetails);

      const query = `
        UPDATE uploaded_files
        SET upload_status = $1, storage_details = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND uploader_user_id = $4
        RETURNING *;
      `;
      const { rows: [updatedFileRecord] } = await db.query(query, [upload_status, finalStorageDetails, fileId, uploader_user_id]);

      if (!updatedFileRecord) { // Should not happen if previous check passed, but defensive
          return res.status(404).json({ message: "Failed to update file record, or record not found."});
      }
      res.status(200).json({ message: `File upload status updated to ${upload_status}.`, file: updatedFileRecord });
    } catch (error) {
      console.error('Error completing file upload:', error.stack);
      res.status(500).json({ message: 'Server error completing file upload.' });
    }
  }
);


// --- Course Quizzes (Metadata) ---
router.post(
  '/course-quizzes', // Not nested under courses, as a quiz could potentially be reused or exist independently first
  verifyToken,
  checkRole(['teacher', 'admin']),
  [
    body('title').notEmpty().trim().escape().withMessage('Quiz title is required.'),
    body('description').optional({ checkFalsy: true }).trim().escape(),
    body('course_id').optional({ checkFalsy: true }).isInt({ gt: 0 }).withMessage('Course ID must be a positive integer if provided.'),
    body('module_id').optional({ checkFalsy: true }).isInt({ gt: 0 }).withMessage('Module ID must be a positive integer if provided.')
    // If module_id is provided, course_id should also be provided or inferable for validation.
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, course_id, module_id } = req.body;
    const created_by_user_id = req.user.id;

    try {
      // Optional: If module_id is given, verify it belongs to course_id if both are present
      if (module_id && course_id) {
        const moduleCheck = await db.query('SELECT id FROM course_modules WHERE id = $1 AND course_id = $2', [module_id, course_id]);
        if (moduleCheck.rows.length === 0) {
          return res.status(400).json({ message: "Invalid module_id for the given course_id." });
        }
      }
      // Optional: Verify course_id belongs to the user if they are not admin (checkCourseOwnershipOrAdmin could be adapted or used if course_id is a param)
      // For simplicity, checkRole ensures teacher/admin, assuming they can create quizzes for any course they manage.

      const query = `
        INSERT INTO course_quizzes (title, description, created_by_user_id, course_id, module_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
      `;
      const values = [title, description, created_by_user_id, course_id || null, module_id || null];
      const { rows: [newQuiz] } = await db.query(query, values);
      res.status(201).json(newQuiz);
    } catch (error) {
      console.error('Error creating course quiz:', error.stack);
      res.status(500).json({ message: 'Server error creating course quiz.' });
    }
  }
);

// --- Labs & Simulations (Metadata) ---
router.post(
  '/labs-simulations', // General endpoint for creating lab/simulation metadata
  verifyToken,
  checkRole(['teacher', 'admin']),
  [
    body('title').notEmpty().trim().escape().withMessage('Lab/Simulation title is required.'),
    body('description').optional({ checkFalsy: true }).trim().escape(),
    body('lab_type').isIn(['interactive_simulation', 'virtual_lab', 'external_link']).withMessage('Invalid lab type.'),
    body('embed_url').optional({ checkFalsy: true }).isURL().withMessage('Embed URL must be a valid URL if provided.'),
    body('config_json').optional({ checkFalsy: true }).isJSON().withMessage('Config JSON must be valid JSON if provided.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, lab_type, embed_url, config_json } = req.body;
    const created_by_user_id = req.user.id;

    try {
      const query = `
        INSERT INTO labs_simulations (title, description, lab_type, embed_url, config_json, created_by_user_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const values = [title, description, lab_type, embed_url || null, config_json ? JSON.parse(config_json) : null, created_by_user_id];
      const { rows: [newLab] } = await db.query(query, values);
      res.status(201).json(newLab);
    } catch (error) {
      console.error('Error creating lab/simulation:', error.stack);
      res.status(500).json({ message: 'Server error creating lab/simulation.' });
    }
  }
);

// --- File Upload Metadata ---
// These routes are general utilities but placed here for now.
// Consider moving to a dedicated /api/files router if it grows.

router.post(
  '/files/initiate-upload', // Will be /api/courses/files/initiate-upload
  verifyToken,
  [
    body('file_name').notEmpty().trim().escape().withMessage('File name is required.'),
    body('mime_type').notEmpty().trim().escape().withMessage('MIME type is required.'),
    body('size_bytes').optional().isInt({ min: 0 }).withMessage('Size must be a non-negative integer.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { file_name, mime_type, size_bytes } = req.body;
    const uploader_user_id = req.user.id;
    const generated_file_path = `user_${uploader_user_id}/${Date.now()}_${file_name.replace(/\s+/g, '_')}`;
    const storage_details = { service: "local_placeholder", path_prefix: "uploads/" }; // Example

    try {
      const query = `
        INSERT INTO uploaded_files (uploader_user_id, file_name, file_path, mime_type, size_bytes, upload_status, storage_details)
        VALUES ($1, $2, $3, $4, $5, 'pending', $6)
        RETURNING id, file_path, upload_status;`;
      const values = [uploader_user_id, file_name, generated_file_path, mime_type, size_bytes || null, JSON.stringify(storage_details)];
      const { rows: [newFileRecord] } = await db.query(query, values);
      res.status(201).json({
        message: "File upload initiated.",
        file_id: newFileRecord.id,
        upload_path_info: newFileRecord.file_path, // Placeholder
        current_status: newFileRecord.upload_status
      });
    } catch (error) {
      console.error('Error initiating file upload:', error.stack);
      res.status(500).json({ message: 'Server error initiating file upload.' });
    }
  }
);

router.post(
  '/files/:fileId/complete-upload', // Will be /api/courses/files/:fileId/complete-upload
  verifyToken,
  [
    param('fileId').isInt({ gt: 0 }).withMessage('File ID must be a positive integer.'),
    body('upload_status').isIn(['completed', 'error']).withMessage("Status must be 'completed' or 'error'.")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { fileId } = req.params;
    const { upload_status, storage_details_update } = req.body;
    const uploader_user_id = req.user.id;

    try {
      const fileCheck = await db.query('SELECT id, storage_details FROM uploaded_files WHERE id = $1 AND uploader_user_id = $2', [fileId, uploader_user_id]);
      if (fileCheck.rows.length === 0) {
        return res.status(404).json({ message: 'File record not found or not owned by user.' });
      }

      const currentStorageDetails = fileCheck.rows[0].storage_details;
      const finalStorageDetails = storage_details_update ? JSON.stringify(storage_details_update) : JSON.stringify(currentStorageDetails);

      const query = `
        UPDATE uploaded_files
        SET upload_status = $1, storage_details = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND uploader_user_id = $4
        RETURNING *;`;
      const { rows: [updatedFileRecord] } = await db.query(query, [upload_status, finalStorageDetails, fileId, uploader_user_id]);

      if (!updatedFileRecord) {
          return res.status(404).json({ message: "Failed to update file record."});
      }
      res.status(200).json({ message: `File upload status updated to ${upload_status}.`, file: updatedFileRecord });
    } catch (error) {
      console.error('Error completing file upload:', error.stack);
      res.status(500).json({ message: 'Server error completing file upload.' });
    }
  }
);


// --- Course Quizzes (Metadata) ---
router.post(
  '/course-quizzes', // Will be /api/courses/course-quizzes
  verifyToken,
  checkRole(['teacher', 'admin']),
  [
    body('title').notEmpty().trim().escape().withMessage('Quiz title is required.'),
    body('description').optional({ checkFalsy: true }).trim().escape(),
    body('course_id').optional({ checkFalsy: true }).isInt({ gt: 0 }).withMessage('Course ID must be a positive integer if provided.'),
    body('module_id').optional({ checkFalsy: true }).isInt({ gt: 0 }).withMessage('Module ID must be a positive integer if provided.')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, course_id, module_id } = req.body;
    const created_by_user_id = req.user.id;

    try {
      if (module_id && course_id) { // If module_id is given, ensure it belongs to course_id
        const moduleCheck = await db.query('SELECT id FROM course_modules WHERE id = $1 AND course_id = $2', [module_id, course_id]);
        if (moduleCheck.rows.length === 0) {
          return res.status(400).json({ message: "Invalid module_id for the given course_id." });
        }
        // Further check if user owns the course_id if they are not admin
        if (req.user.role !== 'admin') {
            const courseOwnerCheck = await db.query('SELECT id FROM courses WHERE id = $1 AND created_by = $2', [course_id, req.user.id]);
            if (courseOwnerCheck.rows.length === 0) {
                 return res.status(403).json({ message: "You do not own the course to add a quiz to this module." });
            }
        }
      } else if (course_id && req.user.role !== 'admin') { // If only course_id, check ownership for non-admins
          const courseOwnerCheck = await db.query('SELECT id FROM courses WHERE id = $1 AND created_by = $2', [course_id, req.user.id]);
          if (courseOwnerCheck.rows.length === 0) {
                return res.status(403).json({ message: "You do not own this course to add a quiz." });
          }
      }


      const query = `
        INSERT INTO course_quizzes (title, description, created_by_user_id, course_id, module_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;`;
      const values = [title, description, created_by_user_id, course_id || null, module_id || null];
      const { rows: [newQuiz] } = await db.query(query, values);
      res.status(201).json(newQuiz);
    } catch (error) {
      console.error('Error creating course quiz:', error.stack);
      res.status(500).json({ message: 'Server error creating course quiz.' });
    }
  }
);

// --- Labs & Simulations (Metadata) ---
router.post(
  '/labs-simulations', // Will be /api/courses/labs-simulations
  verifyToken,
  checkRole(['teacher', 'admin']),
  [
    body('title').notEmpty().trim().escape().withMessage('Lab/Simulation title is required.'),
    body('description').optional({ checkFalsy: true }).trim().escape(),
    body('lab_type').isIn(['interactive_simulation', 'virtual_lab', 'external_link']).withMessage('Invalid lab type.'),
    body('embed_url').optional({ checkFalsy: true }).isURL().withMessage('Embed URL must be a valid URL if provided.'),
    // Ensure config_json is treated as an object by the validator if it's expected to be actual JSON string from client
    body('config_json').optional({ checkFalsy: true }).custom((value) => {
      try {
        JSON.parse(value); // Attempt to parse, if it's a string
        return true;
      } catch (e) {
        if (typeof value === 'object') return true; // Already an object
        throw new Error('Config JSON must be valid JSON if provided.');
      }
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    let { title, description, lab_type, embed_url, config_json } = req.body;
    const created_by_user_id = req.user.id;

    // If config_json is a string, parse it. If it's an object, it's fine.
    if (config_json && typeof config_json === 'string') {
        try {
            config_json = JSON.parse(config_json);
        } catch (e) {
            // This case should be caught by custom validator, but defensive check
            return res.status(400).json({ message: "Invalid JSON string for config_json."});
        }
    }


    try {
      const query = `
        INSERT INTO labs_simulations (title, description, lab_type, embed_url, config_json, created_by_user_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;`;
      const values = [title, description, lab_type, embed_url || null, config_json || null, created_by_user_id];
      const { rows: [newLab] } = await db.query(query, values);
      res.status(201).json(newLab);
    } catch (error) {
      console.error('Error creating lab/simulation:', error.stack);
      res.status(500).json({ message: 'Server error creating lab/simulation.' });
    }
  }
);

module.exports = router;
