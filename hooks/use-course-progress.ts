"use client"

import { useState, useEffect } from "react"
import { progressService, type ProgressData } from "@/lib/progress-service"
import { CourseService } from "@/lib/course-service"
import type { Course } from "@/lib/courses-data"

interface UseCourseProgressProps {
  userId: string
  courseId: string
}

interface UseCourseProgressReturn {
  progress: ProgressData | null
  isLoading: boolean
  completeLesson: (lessonId: string, moduleId: string) => void
  updateLastAccessed: (lessonId: string, moduleId: string) => void
  submitQuizScore: (lessonId: string, moduleId: string, score: number) => void
  submitAssignment: (lessonId: string, moduleId: string, content: string, attachments?: string[]) => void
  isLessonCompleted: (lessonId: string) => boolean
  getNextLesson: (currentModuleId: string, currentLessonId: string) => { moduleId: string; lessonId: string } | null
  getPrevLesson: (currentModuleId: string, currentLessonId: string) => { moduleId: string; lessonId: string } | null
}

export function useCourseProgress({ userId, courseId }: UseCourseProgressProps): UseCourseProgressReturn {
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [course, setCourse] = useState<Course | null>(null)

  // Load progress data
  useEffect(() => {
    setIsLoading(true)

    // Get course data
    const courseData = CourseService.getCourseById(courseId)
    setCourse(courseData || null)

    // Get progress data
    let progressData = progressService.getProgress(userId, courseId)

    // Initialize progress if not exists
    if (!progressData && courseData) {
      progressData = progressService.initializeProgress(userId, courseId)
    }

    setProgress(progressData)
    setIsLoading(false)
  }, [userId, courseId])

  // Mark a lesson as completed
  const completeLesson = (lessonId: string, moduleId: string) => {
    const updatedProgress = progressService.completeLesson(userId, courseId, lessonId, moduleId)
    setProgress(updatedProgress)
  }

  // Update last accessed lesson
  const updateLastAccessed = (lessonId: string, moduleId: string) => {
    const updatedProgress = progressService.updateLastAccessed(userId, courseId, lessonId, moduleId)
    setProgress(updatedProgress)
  }

  // Submit a quiz score
  const submitQuizScore = (lessonId: string, moduleId: string, score: number) => {
    const updatedProgress = progressService.submitQuizScore(userId, courseId, lessonId, moduleId, score)
    setProgress(updatedProgress)
  }

  // Submit an assignment
  const submitAssignment = (lessonId: string, moduleId: string, content: string, attachments?: string[]) => {
    const updatedProgress = progressService.submitAssignment(userId, courseId, lessonId, moduleId, content, attachments)
    setProgress(updatedProgress)
  }

  // Check if a lesson is completed
  const isLessonCompleted = (lessonId: string): boolean => {
    return progress?.completedLessons.includes(lessonId) || false
  }

  // Get next lesson for navigation
  const getNextLesson = (currentModuleId: string, currentLessonId: string) => {
    if (!course) return null
    const { nextLesson } = progressService.getAdjacentLessons(course, currentModuleId, currentLessonId)
    return nextLesson
  }

  // Get previous lesson for navigation
  const getPrevLesson = (currentModuleId: string, currentLessonId: string) => {
    if (!course) return null
    const { prevLesson } = progressService.getAdjacentLessons(course, currentModuleId, currentLessonId)
    return prevLesson
  }

  return {
    progress,
    isLoading,
    completeLesson,
    updateLastAccessed,
    submitQuizScore,
    submitAssignment,
    isLessonCompleted,
    getNextLesson,
    getPrevLesson,
  }
}
