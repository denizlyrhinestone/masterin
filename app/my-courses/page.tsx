"use client"

import { useState, useEffect } from "react"
import { CourseService } from "@/lib/course-service"
import { EnrolledCoursesDashboard } from "@/components/enrolled-courses-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"
import Link from "next/link"

export default function MyCoursesPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [completedCourses, setCompletedCourses] = useState<any[]>([])
  const [inProgressCourses, setInProgressCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // For demo purposes, we'll use a fixed user ID
  const userId = "user-123"

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Get all courses
      const allCourses = CourseService.getAllCourses()

      // Get enrolled courses for user
      const userCourses = CourseService.getEnrolledCoursesForUser(userId, allCourses)

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

  // If no enrolled courses, show empty state
  if (enrolledCourses.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">My Courses</h1>
        <Card>
          <CardHeader>
            <CardTitle>No courses yet</CardTitle>
            <CardDescription>You haven't enrolled in any courses yet.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground mb-6">
              Explore our catalog and find courses that interest you.
            </p>
            <Button asChild>
              <Link href="/categories">Browse Categories</Link>
            </Button>
          </CardContent>
        </Card>
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
