"use client"

import { useState, useEffect } from "react"
import type { Course } from "@/types/course"

export function useCourseDetails(courseId: string) {
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourseDetails = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/courses/${courseId}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch course: ${response.status}`)
        }

        const data = await response.json()
        setCourse(data)
      } catch (err) {
        console.error("Error fetching course details:", err)
        setError("Failed to load course details. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    if (courseId) {
      fetchCourseDetails()
    }
  }, [courseId])

  return { course, isLoading, error }
}
