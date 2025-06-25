const { createTestDb } = require('../testUtils');
const { checkAndAwardCourseCompletionBadge } = require('../../lib/gamificationService');

describe('Gamification Service', () => {
  let db, mockPool, client;
  let userId, courseIdWithBadge, courseIdWithoutBadge, courseCompletionBadgeId;

  beforeEach(async () => {
    const testDbSetup = createTestDb();
    db = testDbSetup.db; // pg-mem instance
    mockPool = testDbSetup.mockPool;
    client = await mockPool.connect(); // pg-mem client
    await client.query('BEGIN'); // Start transaction for each test

    // Seed User
    const userRes = await client.query("INSERT INTO users (email, password_hash, role) VALUES ('gamer@test.com', 'hash', 'student') RETURNING id");
    userId = userRes.rows[0].id;

    // Seed Teacher User (for created_by in courses)
    const teacherRes = await client.query("INSERT INTO users (email, password_hash, role) VALUES ('teacher.gamify@test.com', 'hash', 'teacher') RETURNING id");
    const teacherId = teacherRes.rows[0].id;

    // Seed Courses
    // Course 1: Will have a badge associated with it
    const course1Res = await client.query(
      "INSERT INTO courses (title, created_by, description) VALUES ('Course With Badge', $1, 'Test desc') RETURNING id",
      [teacherId]
    );
    courseIdWithBadge = course1Res.rows[0].id;

    // Course 2: Will NOT have a badge associated
    const course2Res = await client.query(
      "INSERT INTO courses (title, created_by, description) VALUES ('Course No Badge', $1, 'Test desc') RETURNING id",
      [teacherId]
    );
    courseIdWithoutBadge = course2Res.rows[0].id;

    // Seed Badge criteria for courseIdWithBadge
    const badgeRes = await client.query(
      `INSERT INTO badges (name, description, icon_url, criteria)
       VALUES ('Course1 Conqueror', 'Completed Course With Badge', '/img.png', $1) RETURNING id`,
      [JSON.stringify({ type: "course_completion", course_id: courseIdWithBadge })]
    );
    courseCompletionBadgeId = badgeRes.rows[0].id;

    // Seed another badge not related to course completion to ensure specificity
     await client.query(
      `INSERT INTO badges (name, description, icon_url, criteria)
       VALUES ('Early Bird', 'Signed up early', '/early.png', $1) RETURNING id`,
      [JSON.stringify({ type: "signup", date_before: "2024-01-01" })]
    );
  });

  afterEach(async () => {
    await client.query('ROLLBACK'); // Rollback changes after each test
    await client.release();
  });

  it('should award a badge if course is complete, badge exists, and user does not have it yet', async () => {
    // Simulate student progress: courseIdWithBadge is completed by userId
    // Note: ensureStudentProgressRecord would normally create this, but for direct testing:
    await client.query(
      `INSERT INTO student_progress (student_id, course_id, status, completed_lessons_count, total_lessons_count, progress_percentage)
       VALUES ($1, $2, 'completed', 5, 5, 100)`,
      [userId, courseIdWithBadge]
    );

    await checkAndAwardCourseCompletionBadge(userId, courseIdWithBadge, client);

    const userBadgeRes = await client.query("SELECT * FROM user_badges WHERE user_id = $1 AND badge_id = $2", [userId, courseCompletionBadgeId]);
    expect(userBadgeRes.rows.length).toBe(1);
    expect(userBadgeRes.rows[0].badge_id).toBe(courseCompletionBadgeId);
  });

  it('should not award a badge if it has already been awarded to the user for that course', async () => {
    await client.query(
      `INSERT INTO student_progress (student_id, course_id, status, completed_lessons_count, total_lessons_count, progress_percentage)
       VALUES ($1, $2, 'completed', 5, 5, 100)`,
      [userId, courseIdWithBadge]
    );
    // Pre-award the badge
    await client.query("INSERT INTO user_badges (user_id, badge_id, achieved_at) VALUES ($1, $2, NOW())", [userId, courseCompletionBadgeId]);

    await checkAndAwardCourseCompletionBadge(userId, courseIdWithBadge, client);

    const userBadgeRes = await client.query("SELECT COUNT(*) FROM user_badges WHERE user_id = $1 AND badge_id = $2", [userId, courseCompletionBadgeId]);
    expect(parseInt(userBadgeRes.rows[0].count)).toBe(1); // Should still be 1, not awarded again
  });

  it('should not award a badge if the course is not marked as complete in student_progress', async () => {
    await client.query(
      `INSERT INTO student_progress (student_id, course_id, status, completed_lessons_count, total_lessons_count, progress_percentage)
       VALUES ($1, $2, 'in-progress', 2, 5, 40)`,
      [userId, courseIdWithBadge]
    );

    await checkAndAwardCourseCompletionBadge(userId, courseIdWithBadge, client);

    const userBadgeRes = await client.query("SELECT * FROM user_badges WHERE user_id = $1 AND badge_id = $2", [userId, courseCompletionBadgeId]);
    expect(userBadgeRes.rows.length).toBe(0);
  });

  it('should not award a badge if no badge criteria exists for the completed course', async () => {
    await client.query(
      `INSERT INTO student_progress (student_id, course_id, status, completed_lessons_count, total_lessons_count, progress_percentage)
       VALUES ($1, $2, 'completed', 3, 3, 100)`,
      [userId, courseIdWithoutBadge] // courseIdWithoutBadge has no badge defined for its completion
    );

    await checkAndAwardCourseCompletionBadge(userId, courseIdWithoutBadge, client);

    const userBadgeRes = await client.query("SELECT * FROM user_badges WHERE user_id = $1", [userId]); // Check all badges for user
    expect(userBadgeRes.rows.length).toBe(0); // No badges should be awarded
  });

  it('should not award if student_progress record does not exist for the user and course', async () => {
    // No student_progress record for userId and courseIdWithBadge
    await checkAndAwardCourseCompletionBadge(userId, courseIdWithBadge, client);

    const userBadgeRes = await client.query("SELECT * FROM user_badges WHERE user_id = $1 AND badge_id = $2", [userId, courseCompletionBadgeId]);
    expect(userBadgeRes.rows.length).toBe(0);
  });

  it('should handle badge criteria being malformed or not matching type "course_completion"', async () => {
     // Update badge criteria to be something else or malformed
     await client.query(
      `UPDATE badges SET criteria = $1 WHERE id = $2`,
      [JSON.stringify({ type: "other_event", value: 123 }), courseCompletionBadgeId]
    );
    await client.query(
      `INSERT INTO student_progress (student_id, course_id, status, completed_lessons_count, total_lessons_count, progress_percentage)
       VALUES ($1, $2, 'completed', 5, 5, 100)`,
      [userId, courseIdWithBadge]
    );

    await checkAndAwardCourseCompletionBadge(userId, courseIdWithBadge, client);

    const userBadgeRes = await client.query("SELECT * FROM user_badges WHERE user_id = $1 AND badge_id = $2", [userId, courseCompletionBadgeId]);
    expect(userBadgeRes.rows.length).toBe(0); // Should not award if criteria doesn't match
  });
});
