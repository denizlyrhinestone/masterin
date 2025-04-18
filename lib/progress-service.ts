import { CourseService } from "./course-service"
import type { Course } from "./courses-data"

export interface ProgressData {
  userId: string
  courseId: string
  completedLessons: string[]
  lastAccessedLessonId?: string
  lastAccessedModuleId?: string
  lastAccessedAt: string
  overallProgress: number
  quizScores: Record<string, number>
  assignmentSubmissions: Record<string, AssignmentSubmission>
}

export interface AssignmentSubmission {
  id: string
  lessonId: string
  content: string
  submittedAt: string
  attachments?: string[]
  feedback?: string
  grade?: number
  gradedAt?: string
}

class ProgressService {
  // Get progress for a specific course
  getProgress(userId: string, courseId: string): ProgressData | null {
    if (typeof window === "undefined") return null

    const key = `progress_${userId}_${courseId}`
    const stored = localStorage.getItem(key)

    if (!stored) return null

    try {
      return JSON.parse(stored) as ProgressData
    } catch (error) {
      console.error("Error parsing progress data:", error)
      return null
    }
  }

  // Initialize progress tracking for a course
  initializeProgress(userId: string, courseId: string): ProgressData {
    const progress: ProgressData = {
      userId,
      courseId,
      completedLessons: [],
      lastAccessedAt: new Date().toISOString(),
      overallProgress: 0,
      quizScores: {},
      assignmentSubmissions: {},
    }

    this.saveProgress(progress)
    return progress
  }

  // Mark a lesson as completed
  completeLesson(userId: string, courseId: string, lessonId: string, moduleId: string): ProgressData | null {
    let progress = this.getProgress(userId, courseId)

    if (!progress) {
      progress = this.initializeProgress(userId, courseId)
    }

    // Add lesson to completed lessons if not already there
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId)
    }

    // Update last accessed info
    progress.lastAccessedLessonId = lessonId
    progress.lastAccessedModuleId = moduleId
    progress.lastAccessedAt = new Date().toISOString()

    // Calculate overall progress
    this.calculateOverallProgress(progress, courseId)

    // Save updated progress
    this.saveProgress(progress)

    return progress
  }

  // Update last accessed lesson (for "continue learning")
  updateLastAccessed(userId: string, courseId: string, lessonId: string, moduleId: string): ProgressData | null {
    let progress = this.getProgress(userId, courseId)

    if (!progress) {
      progress = this.initializeProgress(userId, courseId)
    }

    progress.lastAccessedLessonId = lessonId
    progress.lastAccessedModuleId = moduleId
    progress.lastAccessedAt = new Date().toISOString()

    this.saveProgress(progress)
    return progress
  }

  // Submit a quiz score
  submitQuizScore(
    userId: string,
    courseId: string,
    lessonId: string,
    moduleId: string,
    score: number,
  ): ProgressData | null {
    let progress = this.getProgress(userId, courseId)

    if (!progress) {
      progress = this.initializeProgress(userId, courseId)
    }

    progress.quizScores[lessonId] = score

    // Mark lesson as completed
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId)
    }

    // Update last accessed info
    progress.lastAccessedLessonId = lessonId
    progress.lastAccessedModuleId = moduleId
    progress.lastAccessedAt = new Date().toISOString()

    // Calculate overall progress
    this.calculateOverallProgress(progress, courseId)

    this.saveProgress(progress)
    return progress
  }

  // Submit an assignment
  submitAssignment(
    userId: string,
    courseId: string,
    lessonId: string,
    moduleId: string,
    content: string,
    attachments?: string[],
  ): ProgressData | null {
    let progress = this.getProgress(userId, courseId)

    if (!progress) {
      progress = this.initializeProgress(userId, courseId)
    }

    const submission: AssignmentSubmission = {
      id: `submission_${Date.now()}`,
      lessonId,
      content,
      submittedAt: new Date().toISOString(),
      attachments,
    }

    progress.assignmentSubmissions[lessonId] = submission

    // Mark lesson as completed
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId)
    }

    // Update last accessed info
    progress.lastAccessedLessonId = lessonId
    progress.lastAccessedModuleId = moduleId
    progress.lastAccessedAt = new Date().toISOString()

    // Calculate overall progress
    this.calculateOverallProgress(progress, courseId)

    this.saveProgress(progress)
    return progress
  }

  // Calculate overall progress percentage
  private calculateOverallProgress(progress: ProgressData, courseId: string): void {
    // Get course data to determine total lessons
    const course = CourseService.getCourseById(courseId)

    if (!course) {
      progress.overallProgress = 0
      return
    }

    const totalLessons = this.countTotalLessons(course)
    const completedCount = progress.completedLessons.length

    progress.overallProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  }

  // Count total lessons in a course
  private countTotalLessons(course: Course): number {
    return course.modules.reduce((total, module) => {
      return total + module.lessons.length
    }, 0)
  }

  // Save progress data
  private saveProgress(progress: ProgressData): void {
    if (typeof window === "undefined") return

    const key = `progress_${progress.userId}_${progress.courseId}`
    localStorage.setItem(key, JSON.stringify(progress))
  }

  // Get all courses with progress for a user
  getAllUserProgress(userId: string): Record<string, ProgressData> {
    if (typeof window === "undefined") return {}

    const progressData: Record<string, ProgressData> = {}

    // Scan localStorage for all progress entries for this user
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(`progress_${userId}_`)) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || "")
          progressData[data.courseId] = data
        } catch (error) {
          console.error("Error parsing progress data:", error)
        }
      }
    }

    return progressData
  }

  // Get next and previous lessons for navigation
  getAdjacentLessons(
    course: Course,
    currentModuleId: string,
    currentLessonId: string,
  ): {
    nextLesson: { moduleId: string; lessonId: string } | null
    prevLesson: { moduleId: string; lessonId: string } | null
  } {
    let foundCurrent = false
    let prevLesson: { moduleId: string; lessonId: string } | null = null
    let nextLesson: { moduleId: string; lessonId: string } | null = null

    // Loop through all modules and lessons to find next and previous
    for (let i = 0; i < course.modules.length; i++) {
      const module = course.modules[i]

      for (let j = 0; j < module.lessons.length; j++) {
        const lesson = module.lessons[j]

        if (foundCurrent) {
          nextLesson = { moduleId: module.id, lessonId: lesson.id }
          break
        }

        if (module.id === currentModuleId && lesson.id === currentLessonId) {
          foundCurrent = true
        } else {
          prevLesson = { moduleId: module.id, lessonId: lesson.id }
        }
      }

      if (nextLesson) break
    }

    return { nextLesson, prevLesson }
  }
}

export const progressService = new ProgressService()
