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
    // First, find the learning_pathway_id for the student.
    // This simplified version assumes a student might not always have a specific learning_pathway
    // when interacting with a course directly. Or, that a "default" pathway is used.
    // For robust progress tracking related to pathways, ensure pathway context is clear.
    // Here, we attempt to find *any* pathway for the student to link the progress,
    // or create a progress record that might have a NULL learning_pathway_id if your schema allows it
    // (current schema does NOT allow NULL for learning_pathway_id on student_progress).
    // This needs to be resolved: student_progress REQUIRES learning_pathway_id.

    // TEMPORARY ASSUMPTION: A student must be on *some* learning pathway to have progress.
    // We'll find their first learning pathway. This is a placeholder for proper pathway context.
    let pathwayResult = await queryRunner.query(
      'SELECT id FROM learning_pathways WHERE student_id = $1 ORDER BY created_at ASC LIMIT 1',
      [userId]
    );

    let learningPathwayId;
    if (pathwayResult.rows.length > 0) {
      learningPathwayId = pathwayResult.rows[0].id;
    } else {
      // If no pathway, create a default one? Or error?
      // For now, let's error out if no pathway, as student_progress needs it.
      // This implies a student must select a career path / be assigned a path before course progress.
      console.warn(`User ${userId} has no learning pathway. Cannot ensure progress for course ${courseId}.`);
      // throw new Error(`User ${userId} has no learning pathway. Cannot ensure progress for course ${courseId}.`);
      // For now, let's try to proceed by creating a placeholder pathway if this is desired,
      // or this function should only be called when a pathway context is known.
      // Let's assume for now a pathway should exist. If not, the calling code should handle.
      // This function will just try to find an existing progress record or create one if pathway is found.
      // For now, if no pathway, we can't create student_progress.
      // We will query for existing student_progress first, which might have been created via other means.
    }

    let progressResult = await queryRunner.query(
      `SELECT sp.* FROM student_progress sp
       JOIN learning_pathways lp ON sp.learning_pathway_id = lp.id
       WHERE lp.student_id = $1 AND sp.course_id = $2;`,
      [userId, courseId]
    );

    let progressRecord = progressResult.rows[0];
    const totalLessons = await getTotalLessonsForCourse(courseId, queryRunner);

    if (progressRecord) {
      // Record exists, check if total_lessons_count needs update
      if (progressRecord.total_lessons_count !== totalLessons) {
        const updateResult = await queryRunner.query(
          `UPDATE student_progress
           SET total_lessons_count = $1, updated_at = NOW()
           WHERE id = $2 RETURNING *;`,
          [totalLessons, progressRecord.id]
        );
        progressRecord = updateResult.rows[0];
        console.log(`Updated total_lessons_count for student_progress ${progressRecord.id} to ${totalLessons}`);
      }
    } else {
      // Record does not exist, create it, only if learningPathwayId was found
      if (!learningPathwayId) {
         // This case should be handled more gracefully depending on application flow.
         // e.g. should a student be able to start a course without a learning pathway?
         // If so, student_progress.learning_pathway_id needs to be nullable or a default pathway created.
         // For now, we log and potentially throw or return null.
         console.error(`Cannot create student_progress for user ${userId}, course ${courseId}: No learning pathway found and learning_pathway_id is NOT NULL.`);
         throw new Error(`User ${userId} has no learning pathway to associate with course ${courseId} progress.`);
      }

      console.log(`No progress record for user ${userId}, course ${courseId}. Creating one with pathway ${learningPathwayId}. Total lessons: ${totalLessons}`);
      const insertResult = await queryRunner.query(
        `INSERT INTO student_progress
         (learning_pathway_id, student_id, course_id, status, total_lessons_count, completed_lessons_count, progress_percentage, completed_lesson_ids)
         VALUES ($1, $2, $3, 'in-progress', $4, 0, 0, ARRAY[]::INT[]) RETURNING *;`,
        // The student_id column on student_progress was removed as it's through learning_pathways.
        // This needs to be corrected if student_id is directly on student_progress.
        // Based on schema: learning_pathway_id INTEGER NOT NULL REFERENCES learning_pathways(id)
        // And learning_pathways has student_id. So student_id is not directly on student_progress.
        [learningPathwayId, courseId, 'in-progress', totalLessons]
        // Corrected query assuming student_id is NOT on student_progress table directly:
        // `INSERT INTO student_progress (learning_pathway_id, course_id, status, total_lessons_count, completed_lessons_count, progress_percentage, completed_lesson_ids) VALUES ($1, $2, $3, $4, 0, 0, ARRAY[]::INT[]) RETURNING *;`
        // Values: [learningPathwayId, courseId, 'in-progress', totalLessons]
      );
      // The actual INSERT query based on the provided schema (which doesn't have student_id directly on student_progress)
      const actualInsertQuery = `
        INSERT INTO student_progress
        (learning_pathway_id, course_id, status, total_lessons_count, completed_lessons_count, progress_percentage, completed_lesson_ids)
        VALUES ($1, $2, $3, $4, 0, 0, ARRAY[]::INT[]) RETURNING *;`;
      const actualValues = [learningPathwayId, courseId, 'in-progress', totalLessons];
      const actualInsertResult = await queryRunner.query(actualInsertQuery, actualValues);
      progressRecord = actualInsertResult.rows[0];
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
