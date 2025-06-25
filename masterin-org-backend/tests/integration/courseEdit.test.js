const request = require('supertest');
const { setupMockDb } = require('./dbMockSetup'); // Utility to get a fresh pg-mem instance
const bcrypt = require('bcryptjs'); // For hashing teacher password

// This will hold the pg-mem instance for the current test suite
let mockDbInstance;

// Mock the database module
jest.mock('../../db/database', () => {
  mockDbInstance = setupMockDb();
  return {
    pool: mockDbInstance.adapters.createPg().pool,
    query: (text, params) => mockDbInstance.public.query(text, params),
    executeSchema: async () => { /* Mocked */ }
  };
});

// Now, import the app AFTER the mocks are set up
const app = require('../../index');

describe('Course Edit Endpoints (/api/courses)', () => {
  let teacherToken;
  let studentToken;
  let teacherId;
  let studentId;

  beforeAll(async () => {
    // Can't use client from beforeEach here as this is beforeAll
    // Need to interact with mockDbInstance directly or via its pool if necessary for setup.
    // Or, perform this setup inside a preliminary test or a helper.
    // For simplicity, directly use mockDbInstance here for initial user seeding.

    const teacherPassword = 'teacherPassword123';
    const teacherPasswordHash = await bcrypt.hash(teacherPassword, 10);
    const teacherRes = await mockDbInstance.public.query(
      "INSERT INTO users (email, password_hash, role, full_name) VALUES ($1, $2, 'teacher', 'Course Teacher') RETURNING id",
      ['course.teacher@example.com', teacherPasswordHash]
    );
    teacherId = teacherRes.rows[0].id;

    const studentPassword = 'studentPassword123';
    const studentPasswordHash = await bcrypt.hash(studentPassword, 10);
    const studentRes = await mockDbInstance.public.query(
      "INSERT INTO users (email, password_hash, role, full_name) VALUES ($1, $2, 'student', 'Course Student') RETURNING id",
      ['course.student@example.com', studentPasswordHash]
    );
    studentId = studentRes.rows[0].id;

    // Log in as teacher to get token
    const loginResTeacher = await request(app)
      .post('/auth/login')
      .send({ email: 'course.teacher@example.com', password: teacherPassword });
    teacherToken = loginResTeacher.body.token;

    // Log in as student to get token
    const loginResStudent = await request(app)
      .post('/auth/login')
      .send({ email: 'course.student@example.com', password: studentPassword });
    studentToken = loginResStudent.body.token;
  });

  beforeEach(async () => {
    // Clear courses table before each test in this suite, but keep users
    if (mockDbInstance) {
        await mockDbInstance.public.query('TRUNCATE courses RESTART IDENTITY CASCADE;');
    }
  });

  describe('POST /api/courses (Create Course)', () => {
    it('should create a new course successfully for a teacher', async () => {
      const courseData = {
        title: 'New Test Course',
        description: 'A description for the new test course.',
        subject: 'Testing',
        grade_level: 'Intermediate',
        // is_publicly_browsable: true, // Optional, defaults to true
        // is_template: false, // Optional, defaults to false
      };

      const res = await request(app)
        .post('/api/courses') // Endpoints are mounted under /api in index.js
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(courseData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toBeDefined();
      expect(res.body.title).toBe(courseData.title);
      expect(res.body.created_by).toBe(teacherId);
      expect(res.body.review_status).toBe('draft'); // Default for new courses

      // Verify in mock DB
      const courseInDb = await mockDbInstance.public.oneOrNone('SELECT * FROM courses WHERE title = $1', [courseData.title]);
      expect(courseInDb).toBeDefined();
      expect(courseInDb.created_by).toBe(teacherId);
    });

    it('should return 403 Forbidden when a student tries to create a course', async () => {
      const courseData = { title: 'Student Course Attempt', description: 'Desc' };
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(courseData);

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toContain('Access Denied: User does not have the required role(s).');
    });

    it('should return 401 Unauthorized when no token is provided', async () => {
      const courseData = { title: 'No Token Course', description: 'Desc' };
      const res = await request(app)
        .post('/api/courses')
        .send(courseData);

      expect(res.statusCode).toEqual(401); // or 403 depending on how verifyToken handles missing token vs invalid
                                          // Our verifyToken sends 401 if no token
      expect(res.body.message).toBe('Access Denied: No token provided.');
    });

    it('should return 400 Bad Request for invalid data (e.g., missing title)', async () => {
      const courseData = { description: 'Course without title' }; // Missing title
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(courseData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ msg: 'Title is required.' })
        ])
      );
    });

     it('should return 400 Bad Request for invalid thumbnail_image_url', async () => {
      const courseData = {
        title: 'Course with invalid thumbnail',
        description: 'Desc',
        thumbnail_image_url: 'not-a-url'
      };
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(courseData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ msg: 'Thumbnail URL must be a valid URL.' })
        ])
      );
    });
  });

  // TODO: Add tests for other course edit endpoints (GET /my-courses, GET /:courseId/edit, PUT /:courseId, DELETE /:courseId)
  // TODO: Add tests for module, lesson, and content block CRUD operations, ensuring ownership and roles.
});
