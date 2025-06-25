const db = require('../db/database'); // Or wherever your db pool is exported
const { sendEmail, SES_FROM_EMAIL } = require('./emailService'); // Import email service

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
 * @returns {Promise<{progressRecord: object, isNewEnrollment: boolean}>} - The student_progress record and a flag.
 */
async function ensureStudentProgressRecord(userId, courseId, client) {
  const queryRunner = client || db; // Should ideally always be a client from a transaction
  let isNewEnrollment = false;

  try {
    // Try to find an existing progress record for the student and course
    const existingProgressResult = await queryRunner.query(
      'SELECT * FROM student_progress WHERE student_id = $1 AND course_id = $2',
      [userId, courseId]
    );

    let progressRecord = existingProgressResult.rows[0];
    const currentTotalLessons = await getTotalLessonsForCourse(courseId, queryRunner);

    if (progressRecord) {
      // Record exists, check if total_lessons_count needs update (also check if it was null before)
      if (progressRecord.total_lessons_count !== currentTotalLessons || progressRecord.total_lessons_count === null) {
        const updateResult = await queryRunner.query(
          'UPDATE student_progress SET total_lessons_count = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
          [currentTotalLessons, progressRecord.id]
        );
        progressRecord = updateResult.rows[0];
        console.log(`Updated total_lessons_count for student_progress ${progressRecord.id} to ${currentTotalLessons}`);
      }
    } else {
      isNewEnrollment = true;
      // Record does not exist, create it.
      console.log(`No progress record for user ${userId}, course ${courseId}. Creating one. Total lessons: ${currentTotalLessons}`);
      const insertResult = await queryRunner.query(
        `INSERT INTO student_progress
           (student_id, course_id, status, total_lessons_count, completed_lessons_count, progress_percentage, completed_lesson_ids)
         VALUES ($1, $2, 'in-progress', $3, 0, 0, ARRAY[]::INT[]) RETURNING *`,
        [userId, courseId, currentTotalLessons]
      );
      progressRecord = insertResult.rows[0];

      // If it's a new enrollment, send confirmation email
      if (isNewEnrollment && SES_FROM_EMAIL && sendEmail) {
        try {
          // These queries need to use the same client if ensureStudentProgressRecord is part of a larger transaction
          const userResult = await queryRunner.query('SELECT email, full_name FROM users WHERE id = $1', [userId]);
          const courseResult = await queryRunner.query('SELECT title FROM courses WHERE id = $1', [courseId]);

          if (userResult.rows.length > 0 && courseResult.rows.length > 0) {
            const user = userResult.rows[0];
            const course = courseResult.rows[0];
            const userEmailForEnroll = user.email;
            const userNameForEnroll = user.full_name || userEmailForEnroll.split('@')[0];
            const courseTitleForEmail = course.title;

            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const subject = `You're Enrolled: ${courseTitleForEmail} on MasterIn.org`;
            const textBody = `Hello ${userNameForEnroll},\n\n` +
                             `This confirms your enrollment in the course "${courseTitleForEmail}" on MasterIn.org!\n\n` +
                             `You can start or continue your learning here: ${frontendUrl}/learn/${courseId}\n\n` + // Assuming /learn/:courseId is the course player route
                             `We're excited to see what you accomplish.\n\n` +
                             `Happy learning!\n` +
                             `The MasterIn.org Team`;
            const htmlBody = `<html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                              <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                                <h2 style="color: #0056b3;">Course Enrollment Confirmation</h2>
                                <p>Hello ${userNameForEnroll},</p>
                                <p>This confirms your enrollment in the course <strong>"${courseTitleForEmail}"</strong> on MasterIn.org!</p>
                                <p>You can start or continue your learning right away by clicking the button below:</p>
                                <p style="text-align: center;">
                                  <a href="${frontendUrl}/learn/${courseId}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Course</a>
                                </p>
                                <p>We're excited to see what you accomplish.</p>
                                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;"/>
                                <p style="font-size: 0.9em; color: #777;">Happy learning!</p>
                                <p style="font-size: 0.9em; color: #777;">The MasterIn.org Team</p>
                              </div>
                            </body></html>`;

            // Fire-and-forget email sending
            sendEmail({ to: userEmailForEnroll, subject, htmlBody, textBody })
              .then(emailResult => {
                if (emailResult.success) {
                  console.log(`Course enrollment confirmation sent to ${userEmailForEnroll} for course ID ${courseId}. Message ID: ${emailResult.messageId}`);
                } else {
                  console.error(`Failed to send course enrollment confirmation to ${userEmailForEnroll} for course ID ${courseId}: ${emailResult.error}`);
                }
              })
              .catch(error => {
                console.error(`Unexpected error sending course enrollment email to ${userEmailForEnroll} for course ID ${courseId}:`, error);
              });
          } else {
            console.warn(`Could not send enrollment email: User or Course not found for userId: ${userId}, courseId: ${courseId} during email data fetch.`);
          }
        } catch (emailDataError) {
          // Catch errors from fetching user/course data for email, to not break progress record creation
          console.error(`Error fetching data for enrollment email (userId: ${userId}, courseId: ${courseId}):`, emailDataError);
        }
      } else if (isNewEnrollment) { // Only log skip if it was a new enrollment
        console.log(`Course enrollment email for user ID ${userId}, course ID ${courseId} skipped: Email service not configured.`);
      }
    }
    return { progressRecord, isNewEnrollment }; // Return object
  } catch (error) {
    console.error(`Error in ensureStudentProgressRecord for user ${userId}, course ${courseId}:`, error);
    throw error; // Re-throw for transaction management by caller
  }
}

module.exports = {
  getTotalLessonsForCourse,
  ensureStudentProgressRecord,
};
