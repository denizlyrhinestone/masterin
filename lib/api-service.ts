// This service will handle all API calls and data operations
// Currently using localStorage for persistence, but can be replaced with actual API calls

import { CourseService } from "./course-service"
import { progressService } from "./progress-service"
import type { Course, Instructor } from "./courses-data"
import type { ProgressData } from "./progress-service"

// Define API endpoints (for future use)
const API_ENDPOINTS = {
  COURSES: "/api/courses",
  COURSE: (id: string) => `/api/courses/${id}`,
  ENROLL: (courseId: string) => `/api/courses/${courseId}/enroll`,
  PROGRESS: (courseId: string) => `/api/courses/${courseId}/progress`,
  COMPLETE_LESSON: (courseId: string, lessonId: string) => `/api/courses/${courseId}/lessons/${lessonId}/complete`,
  QUIZ_SUBMISSION: (courseId: string, lessonId: string) => `/api/courses/${courseId}/lessons/${lessonId}/quiz`,
  ASSIGNMENT_SUBMISSION: (courseId: string, lessonId: string) =>
    `/api/courses/${courseId}/lessons/${lessonId}/assignment`,
  INSTRUCTORS: "/api/instructors",
  INSTRUCTOR: (id: string) => `/api/instructors/${id}`,
}

// Error handling wrapper
async function handleApiRequest<T>(requestFn: () => Promise<T>, errorMessage: string): Promise<T> {
  try {
    return await requestFn()
  } catch (error) {
    console.error(`${errorMessage}:`, error)
    throw new Error(errorMessage)
  }
}

// API Service class
export class ApiService {
  // Course-related methods
  static async getCourses(): Promise<Course[]> {
    // In a real app, this would be an API call
    return handleApiRequest(async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      return CourseService.getAllCourses()
    }, "Failed to fetch courses")
  }

  static async getCourseById(courseId: string): Promise<Course | null> {
    return handleApiRequest(async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300))
      return CourseService.getCourseById(courseId)
    }, `Failed to fetch course with ID: ${courseId}`)
  }

  static async enrollInCourse(userId: string, courseId: string): Promise<boolean> {
    return handleApiRequest(async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 700))

      // Enroll user in course
      CourseService.enrollUserInCourse(userId, courseId)

      // Initialize progress tracking
      progressService.initializeProgress(userId, courseId)

      return true
    }, `Failed to enroll in course with ID: ${courseId}`)
  }

  // Progress-related methods
  static async getProgress(userId: string, courseId: string): Promise<ProgressData | null> {
    return handleApiRequest(async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 200))
      return progressService.getProgress(userId, courseId)
    }, `Failed to fetch progress for course: ${courseId}`)
  }

  static async completeLesson(
    userId: string,
    courseId: string,
    lessonId: string,
    moduleId: string,
  ): Promise<ProgressData | null> {
    return handleApiRequest(async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      return progressService.completeLesson(userId, courseId, lessonId, moduleId)
    }, `Failed to mark lesson ${lessonId} as completed`)
  }

  static async submitQuiz(
    userId: string,
    courseId: string,
    lessonId: string,
    moduleId: string,
    score: number,
  ): Promise<ProgressData | null> {
    return handleApiRequest(async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800))
      return progressService.submitQuizScore(userId, courseId, lessonId, moduleId, score)
    }, `Failed to submit quiz for lesson ${lessonId}`)
  }

  static async submitAssignment(
    userId: string,
    courseId: string,
    lessonId: string,
    moduleId: string,
    content: string,
    attachments?: string[],
  ): Promise<ProgressData | null> {
    return handleApiRequest(async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return progressService.submitAssignment(userId, courseId, lessonId, moduleId, content, attachments)
    }, `Failed to submit assignment for lesson ${lessonId}`)
  }

  // Instructor-related methods
  static async getInstructorById(instructorId: string): Promise<Instructor | null> {
    return handleApiRequest(async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      // In a real app, this would be an API call
      const courses = CourseService.getAllCourses()
      const instructor = courses.find((course) => course.instructor.id === instructorId)?.instructor || null

      return instructor
    }, `Failed to fetch instructor with ID: ${instructorId}`)
  }

  static async getInstructorCourses(instructorId: string): Promise<Course[]> {
    return handleApiRequest(async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 400))

      // In a real app, this would be an API call
      const courses = CourseService.getAllCourses()
      return courses.filter((course) => course.instructor.id === instructorId)
    }, `Failed to fetch courses for instructor: ${instructorId}`)
  }

  // User-related methods (for future implementation)
  static async getUserEnrolledCourses(userId: string): Promise<Course[]> {
    return handleApiRequest(async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 600))

      const allCourses = CourseService.getAllCourses()
      return CourseService.getEnrolledCoursesForUser(userId, allCourses)
    }, `Failed to fetch enrolled courses for user: ${userId}`)
  }
}
