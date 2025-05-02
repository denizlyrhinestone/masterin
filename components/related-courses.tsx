"use client"

import { useEffect, useState } from "react"
import type { Course } from "@/types/course"
import { CourseCard } from "@/components/course-card"
import { Skeleton } from "@/components/ui/skeleton"

interface RelatedCoursesProps {
  courseIds: string[]
  currentCourseId: string
}

export function RelatedCourses({ courseIds, currentCourseId }: RelatedCoursesProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRelatedCourses = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch each course in parallel
        const promises = courseIds.map((id) =>
          fetch(`/api/courses/${id}`).then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch course ${id}`)
            return res.json()
          }),
        )

        const fetchedCourses = await Promise.all(promises)
        setCourses(fetchedCourses.filter((course) => course.id !== currentCourseId))
      } catch (err) {
        console.error("Error fetching related courses:", err)
        setError("Failed to load related courses")
      } finally {
        setIsLoading(false)
      }
    }

    if (courseIds.length > 0) {
      fetchRelatedCourses()
    }
  }, [courseIds, currentCourseId])

  if (isLoading) {
    return (
      <div>
        <h3 className="text-xl font-semibold mb-4">Related Courses</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || courses.length === 0) {
    return null // Don't show section if there's an error or no related courses
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Related Courses</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
}
