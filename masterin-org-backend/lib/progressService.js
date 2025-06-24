const db = require('../db/database'); // Or wherever your db pool is exported

/**
 * Calculates the total number of lessons for a given course.
 * @param {number} courseId - The ID of the course.
 * @param {object} client - The database client (can be from pool or a transaction).
 * @returns {Promise<number>} - The total number of lessons.
 */
async function getTotalLessonsForCourse(courseId, client) {
  const queryRunner = client || db;
  try {
    const result = await queryRunner.query(
      `SELECT COUNT(l.id) AS total_lessons
       FROM lessons l
       JOIN course_modules m ON l.module_id = m.id
       WHERE m.course_id = $1;`,
      [courseId]
    );
    return parseInt(result.rows[0]?.total_lessons || '0', 10);
  } catch (error) {
    console.error(`Error fetching total lessons for course ${courseId}:`, error);
    throw error; // Re-throw to be handled by caller
  }
}

/**
 * Ensures a student_progress record exists for a user and course.
 * If it exists, it updates total_lessons_count if necessary.
 * If it doesn't exist, it creates one.
 * This function should ideally be called within a transaction if it performs an UPDATE or INSERT.
 * @param {number} userId - The ID of the user.
 * @param {number} courseId - The ID of the course.
 * @param {object} client - The database client (MUST be from a transaction if this function modifies data).
 * @returns {Promise<object>} - The student_progress record.
 */
async function ensureStudentProgressRecord(userId, courseId, client) {
  const queryRunner = client || db; // Should ideally always be a client from a transaction

  try {
    // Try to find an existing progress record for the student and course
    const existingProgressResult = await queryRunner.query(
      'SELECT * FROM student_progress WHERE student_id = $1 AND course_id = $2',
      [userId, courseId]
    );

    let progressRecord = existingProgressResult.rows[0];
    const currentTotalLessons = await getTotalLessonsForCourse(courseId, queryRunner);

    if (progressRecord) {
      // Record exists, check if total_lessons_count needs update
      if (progressRecord.total_lessons_count !== currentTotalLessons) {
        const updateResult = await queryRunner.query(
          'UPDATE student_progress SET total_lessons_count = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
          [currentTotalLessons, progressRecord.id]
        );
        progressRecord = updateResult.rows[0];
        console.log(`Updated total_lessons_count for student_progress ${progressRecord.id} to ${currentTotalLessons}`);
      }
    } else {
      // Record does not exist, create it.
      // Status defaults to 'not-started' in DB, but 'in-progress' might be better if this function is called when a user actively engages.
      // For consistency with previous logic which set 'in-progress', we'll set it here.
      // completed_lessons_count and progress_percentage default to 0.
      // completed_lesson_ids defaults to empty array.
      console.log(`No progress record for user ${userId}, course ${courseId}. Creating one. Total lessons: ${currentTotalLessons}`);
      const insertResult = await queryRunner.query(
        `INSERT INTO student_progress
           (student_id, course_id, status, total_lessons_count)
         VALUES ($1, $2, 'in-progress', $3) RETURNING *`, // Rely on DB defaults for other fields
        [userId, courseId, currentTotalLessons]
      );
      progressRecord = insertResult.rows[0];
    }
    return progressRecord;
  } catch (error) {
    console.error(`Error in ensureStudentProgressRecord for user ${userId}, course ${courseId}:`, error);
    throw error; // Re-throw for transaction management by caller
  }
}

module.exports = {
  getTotalLessonsForCourse,
  ensureStudentProgressRecord,
};
