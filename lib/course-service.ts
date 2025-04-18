import type { Course } from "./courses-data"

// Types for enrollment and progress tracking
export interface EnrollmentStatus {
  enrolled: boolean
  enrollmentDate?: string
  completedLessons: string[] // Array of lesson IDs
  completedModules: string[] // Array of module IDs
  lastAccessedLessonId?: string
  progress: number // 0-100
  quizScores: Record<string, number> // Quiz ID to score
  assignmentSubmissions: Record<string, AssignmentSubmission> // Assignment ID to submission
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  submissionDate: string
  content: string
  attachments?: string[]
  grade?: number
  feedback?: string
}

// In a real application, this would be stored in a database
// For this demo, we'll use localStorage in the browser
export class CourseService {
  // Get enrollment status for a course
  static getEnrollmentStatus(userId: string, courseId: string): EnrollmentStatus | null {
    if (typeof window === "undefined") return null

    const key = `enrollment_${userId}_${courseId}`
    const stored = localStorage.getItem(key)

    if (!stored) return null

    try {
      return JSON.parse(stored) as EnrollmentStatus
    } catch (error) {
      console.error("Error parsing enrollment data:", error)
      return null
    }
  }

  // Enroll a user in a course
  static enrollUserInCourse(userId: string, courseId: string): EnrollmentStatus {
    const enrollment: EnrollmentStatus = {
      enrolled: true,
      enrollmentDate: new Date().toISOString(),
      completedLessons: [],
      completedModules: [],
      progress: 0,
      quizScores: {},
      assignmentSubmissions: {},
    }

    if (typeof window !== "undefined") {
      const key = `enrollment_${userId}_${courseId}`
      localStorage.setItem(key, JSON.stringify(enrollment))
    }

    return enrollment
  }

  // Mark a lesson as completed
  static completeLessonForUser(userId: string, courseId: string, lessonId: string): EnrollmentStatus | null {
    const enrollment = this.getEnrollmentStatus(userId, courseId)

    if (!enrollment) return null

    // Add lesson to completed lessons if not already there
    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId)
    }

    // Update progress
    this.updateProgress(userId, courseId, enrollment)

    return enrollment
  }

  // Update the user's progress in the course
  private static updateProgress(userId: string, courseId: string, enrollment: EnrollmentStatus): void {
    if (typeof window === "undefined") return

    const key = `enrollment_${userId}_${courseId}`
    localStorage.setItem(key, JSON.stringify(enrollment))
  }

  // Calculate progress percentage for a course
  static calculateProgress(course: Course, completedLessons: string[]): number {
    let totalLessons = 0
    let completedCount = 0

    course.modules.forEach((module) => {
      totalLessons += module.lessons.length
      module.lessons.forEach((lesson) => {
        if (completedLessons.includes(lesson.id)) {
          completedCount++
        }
      })
    })

    return totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  }

  // Submit a quiz score
  static submitQuizScore(userId: string, courseId: string, quizId: string, score: number): EnrollmentStatus | null {
    const enrollment = this.getEnrollmentStatus(userId, courseId)

    if (!enrollment) return null

    enrollment.quizScores[quizId] = score
    this.updateProgress(userId, courseId, enrollment)

    return enrollment
  }

  // Submit an assignment
  static submitAssignment(
    userId: string,
    courseId: string,
    assignmentId: string,
    content: string,
    attachments?: string[],
  ): EnrollmentStatus | null {
    const enrollment = this.getEnrollmentStatus(userId, courseId)

    if (!enrollment) return null

    const submission: AssignmentSubmission = {
      id: `submission_${Date.now()}`,
      assignmentId,
      submissionDate: new Date().toISOString(),
      content,
      attachments,
    }

    enrollment.assignmentSubmissions[assignmentId] = submission
    this.updateProgress(userId, courseId, enrollment)

    return enrollment
  }

  // Get all enrolled courses for a user
  static getEnrolledCoursesForUser(userId: string, allCourses: Course[]): Course[] {
    if (typeof window === "undefined") return []

    const enrolledCourses: Course[] = []

    allCourses.forEach((course) => {
      const key = `enrollment_${userId}_${course.id}`
      const stored = localStorage.getItem(key)

      if (stored) {
        try {
          const enrollment = JSON.parse(stored) as EnrollmentStatus
          if (enrollment.enrolled) {
            enrolledCourses.push({
              ...course,
              progress: this.calculateProgress(course, enrollment.completedLessons),
            })
          }
        } catch (error) {
          console.error("Error parsing enrollment data:", error)
        }
      }
    })

    return enrolledCourses
  }
}
