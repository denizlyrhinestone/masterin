const { createTestDb } = require('../testUtils');
const { getTotalLessonsForCourse, ensureStudentProgressRecord } = require('../../lib/progressService');
const { sendEmail, SES_FROM_EMAIL } = require('../../lib/emailService'); // Import to mock

// Mock the emailService
jest.mock('../../lib/emailService', () => ({
  ...jest.requireActual('../../lib/emailService'), // Keep other exports if any (like SES_FROM_EMAIL if used directly by service)
  sendEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'mock-message-id' }),
  // Provide a mock value for SES_FROM_EMAIL because progressService checks for its existence
  SES_FROM_EMAIL: 'test-sender@example.com'
}));

describe('Progress Service', () => {
  let db, mockPool, client; // db is the pg-mem instance, client is a connection from mockPool

  beforeEach(async () => {
    const testDbSetup = createTestDb();
    db = testDbSetup.db;
    mockPool = testDbSetup.mockPool;
    client = await mockPool.connect(); // Get a pg-mem client
    await client.query('BEGIN'); // Start transaction for each test for isolation

    // Mock process.env.FRONTEND_URL for email link generation
    process.env.FRONTEND_URL = 'http://localhost:7000'; // Using a different port to ensure it's from test
  });

  afterEach(async () => {
    await client.query('ROLLBACK'); // Rollback changes after each test
    await client.release(); // Release the client
    sendEmail.mockClear(); // Clear mock call history for sendEmail
    delete process.env.FRONTEND_URL; // Clean up env var
  });

  describe('getTotalLessonsForCourse', () => {
    it('should return correct total lessons for a course', async () => {
      // Seed data directly using the client
      const userRes = await client.query("INSERT INTO users (email, password_hash, role) VALUES ('teacher@test.com', 'hash', 'teacher') RETURNING id");
      const teacherId = userRes.rows[0].id;
      const courseRes = await client.query("INSERT INTO courses (title, description, created_by) VALUES ('Test Course', 'Desc', $1) RETURNING id", [teacherId]);
      const courseId = courseRes.rows[0].id;
      const moduleRes = await client.query("INSERT INTO course_modules (course_id, title) VALUES ($1, 'M1') RETURNING id", [courseId]);
      const moduleId = moduleRes.rows[0].id;
      await client.query("INSERT INTO lessons (module_id, title) VALUES ($1, 'L1')", [moduleId]);
      await client.query("INSERT INTO lessons (module_id, title) VALUES ($1, 'L2')", [moduleId]);

      const total = await getTotalLessonsForCourse(courseId, client);
      expect(total).toBe(2);
    });

    it('should return 0 if course has no lessons', async () => {
      const userRes = await client.query("INSERT INTO users (email, password_hash, role) VALUES ('teacher2@test.com', 'hash', 'teacher') RETURNING id");
      const teacherId = userRes.rows[0].id;
      const courseRes = await client.query("INSERT INTO courses (title, description, created_by) VALUES ('Empty Course', 'Desc', $1) RETURNING id", [teacherId]);
      const courseId = courseRes.rows[0].id;

      const total = await getTotalLessonsForCourse(courseId, client);
      expect(total).toBe(0);
    });
  });

  describe('ensureStudentProgressRecord', () => {
    let userId, courseId;

    beforeEach(async () => {
      // Seed a user and a course for these tests
      const userRes = await client.query("INSERT INTO users (email, password_hash, role, full_name) VALUES ('student@test.com', 'hash', 'student', 'Test Student') RETURNING id");
      userId = userRes.rows[0].id;

      const teacherRes = await client.query("INSERT INTO users (email, password_hash, role) VALUES ('courseteacher@test.com', 'hash', 'teacher') RETURNING id");
      const teacherId = teacherRes.rows[0].id;

      const courseRes = await client.query("INSERT INTO courses (title, description, created_by) VALUES ('Progress Course', 'Desc', $1) RETURNING id", [teacherId]);
      courseId = courseRes.rows[0].id;

      // Seed 2 lessons for this course
      const moduleRes = await client.query("INSERT INTO course_modules (course_id, title) VALUES ($1, 'M1 Prog') RETURNING id", [courseId]);
      const moduleId = moduleRes.rows[0].id;
      await client.query("INSERT INTO lessons (module_id, title) VALUES ($1, 'L1 Prog')", [moduleId]);
      await client.query("INSERT INTO lessons (module_id, title) VALUES ($1, 'L2 Prog')", [moduleId]);
    });

    it('should create a new progress record if none exists and send enrollment email', async () => {
      const { progressRecord, isNewEnrollment } = await ensureStudentProgressRecord(userId, courseId, client);

      expect(isNewEnrollment).toBe(true);
      expect(progressRecord).toBeDefined();
      expect(progressRecord.student_id).toBe(userId);
      expect(progressRecord.course_id).toBe(courseId);
      expect(progressRecord.status).toBe('in-progress');
      expect(progressRecord.total_lessons_count).toBe(2); // Based on seeded lessons
      expect(progressRecord.completed_lessons_count).toBe(0);
      expect(progressRecord.progress_percentage).toBe(0);
      expect(progressRecord.completed_lesson_ids).toEqual([]);

      expect(sendEmail).toHaveBeenCalledTimes(1);
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'student@test.com',
        subject: "You're Enrolled: Progress Course on MasterIn.org",
      }));
    });

    it('should return existing progress record and not send email if record exists', async () => {
      // First call creates it and sends email
      await ensureStudentProgressRecord(userId, courseId, client);
      sendEmail.mockClear(); // Clear mock call history before the second call

      const { progressRecord, isNewEnrollment } = await ensureStudentProgressRecord(userId, courseId, client);

      expect(isNewEnrollment).toBe(false);
      expect(progressRecord).toBeDefined();
      expect(progressRecord.total_lessons_count).toBe(2); // Should reflect existing count
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it('should update total_lessons_count if course structure changed', async () => {
      await ensureStudentProgressRecord(userId, courseId, client); // Creates with 2 lessons

      // Add another lesson to the same module
      const moduleRes = await client.query("SELECT id FROM course_modules WHERE course_id = $1 LIMIT 1", [courseId]);
      const moduleId = moduleRes.rows[0].id;
      await client.query("INSERT INTO lessons (module_id, title) VALUES ($1, 'L3 Prog')", [moduleId]);

      const { progressRecord } = await ensureStudentProgressRecord(userId, courseId, client);
      expect(progressRecord.total_lessons_count).toBe(3);
    });

    it('should correctly handle total_lessons_count if it was null previously', async () => {
      // Manually insert a progress record with null total_lessons_count
       await client.query(
        `INSERT INTO student_progress
           (student_id, course_id, status, total_lessons_count, completed_lessons_count, progress_percentage, completed_lesson_ids)
         VALUES ($1, $2, 'in-progress', NULL, 0, 0, ARRAY[]::INT[])`,
        [userId, courseId]
      );

      const { progressRecord } = await ensureStudentProgressRecord(userId, courseId, client);
      expect(progressRecord.total_lessons_count).toBe(2); // Should be updated from NULL to 2
    });
  });
});
