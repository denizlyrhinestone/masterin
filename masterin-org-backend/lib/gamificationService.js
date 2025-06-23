const db = require('../db/database'); // Assuming db/database.js exports the pool or query function

/**
 * Checks if a course is completed and awards a course completion badge if criteria are met.
 * @param {number} userId - The ID of the user.
 * @param {number} courseId - The ID of the course.
 * @param {object} dbClient - Optional: A database client if this function is called within an existing transaction.
 */
async function checkAndAwardCourseCompletionBadge(userId, courseId, dbClient) {
  const queryRunner = dbClient || db; // Use provided client or default pool

  try {
    // 1. Check if the course is actually completed by the user
    // This relies on student_progress having accurate total_lessons_count and completed_lessons_count
    const progressQuery = `
      SELECT sp.status, sp.completed_lessons_count, sp.total_lessons_count, c.title as course_title
      FROM student_progress sp
      JOIN courses c ON sp.course_id = c.id
      JOIN learning_pathways lp ON sp.learning_pathway_id = lp.id
      WHERE lp.student_id = $1 AND sp.course_id = $2;
    `;
    // Note: The above query assumes a direct link from student_id (via learning_pathways) to course_id in student_progress.
    // If a student can have progress on a course not tied to a learning pathway, this needs adjustment,
    // or we assume student_progress always has a valid learning_pathway_id linked to the student.
    // For simplicity, we'll proceed with this. A direct student_id on student_progress might be another model.

    const progressResult = await queryRunner.query(progressQuery, [userId, courseId]);

    if (progressResult.rows.length === 0) {
      console.log(`Gamification: No progress found for user ${userId} in course ${courseId}. Cannot award badge.`);
      return;
    }

    const progress = progressResult.rows[0];
    // Ensure total_lessons_count is not zero and completed_lessons_count meets or exceeds it.
    // Or, simply rely on the 'status' field if it's accurately updated to 'completed'.
    if (progress.status !== 'completed' && (progress.total_lessons_count === 0 || progress.completed_lessons_count < progress.total_lessons_count)) {
      console.log(`Gamification: Course ${courseId} (${progress.course_title || 'Unknown Title'}) not yet completed by user ${userId}. Current progress: ${progress.completed_lessons_count}/${progress.total_lessons_count}`);
      return;
    }

    console.log(`Gamification: Course ${courseId} (${progress.course_title || 'Unknown Title'}) completed by user ${userId}. Checking for badges.`);

    // 2. Find relevant course completion badges
    const badgeCriteria = { type: "course_completion", course_id: Number(courseId) }; // Ensure courseId is number
    const findBadgesQuery = `
      SELECT id, name FROM badges
      WHERE criteria->>'type' = $1 AND (criteria->>'course_id')::INT = $2;
    `;
    const badgesResult = await queryRunner.query(findBadgesQuery, [badgeCriteria.type, badgeCriteria.course_id]);

    if (badgesResult.rows.length === 0) {
      console.log(`Gamification: No 'course_completion' badges found for course ID ${courseId}.`);
      return;
    }

    // 3. Award each found badge if not already awarded
    for (const badge of badgesResult.rows) {
      try {
        const insertUserBadgeQuery = `
          INSERT INTO user_badges (user_id, badge_id, achieved_at)
          VALUES ($1, $2, NOW())
          ON CONFLICT (user_id, badge_id) DO NOTHING
          RETURNING id;
        `;
        // Check if RETURNING id gives a row to know if it was newly inserted
        const awardResult = await queryRunner.query(insertUserBadgeQuery, [userId, badge.id]);
        if (awardResult.rows.length > 0 && awardResult.rows[0].id) {
            console.log(`Gamification: Awarded badge "${badge.name}" to user ${userId} for completing course ${courseId}.`);
        } else {
            // console.log(`Gamification: User ${userId} already had badge "${badge.name}" or failed to award.`);
        }
      } catch (awardError) {
        console.error(`Gamification: Error awarding badge ID ${badge.id} to user ${userId} for course ${courseId}:`, awardError.stack);
        // Continue to try awarding other relevant badges
      }
    }
  } catch (error) {
    console.error(`Gamification: General error in checkAndAwardCourseCompletionBadge for user ${userId}, course ${courseId}:`, error.stack);
    // If using a provided client, rethrow to let the caller handle transaction rollback
    if (dbClient) {
      throw error; // Rethrow to be caught by the calling transaction
    }
  }
}

module.exports = {
  checkAndAwardCourseCompletionBadge,
};
