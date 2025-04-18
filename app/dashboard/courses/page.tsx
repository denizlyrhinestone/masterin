"use client"

import { useEffect, useState } from "react"
import { courses } from "@/lib/courses-data"
import { CourseService } from "@/lib/course-service"
import { EnrolledCoursesDashboard } from "@/components/enrolled-courses-dashboard"

export default function EnrolledCoursesPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [completedCourses, setCompletedCourses] = useState<any[]>([])
  const [inProgressCourses, setInProgressCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // For demo purposes, we'll use a fixed user ID
  const userId = "user-123"

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userCourses = CourseService.getEnrolledCoursesForUser(userId, courses)

      // Separate completed and in-progress courses
      const completed = userCourses.filter((course) => course.progress === 100)
      const inProgress = userCourses.filter((course) => course.progress !== 100)

      setEnrolledCourses(userCourses)
      setCompletedCourses(completed)
      setInProgressCourses(inProgress)
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">My Courses</h1>
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-64 bg-muted rounded-lg"></div>
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground">Track your progress and continue learning.</p>
      </div>

      <EnrolledCoursesDashboard
        enrolledCourses={enrolledCourses}
        completedCourses={completedCourses}
        inProgressCourses={inProgressCourses}
      />
    </div>
  )
}
