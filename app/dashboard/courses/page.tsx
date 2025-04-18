"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BookOpen, Calendar } from "lucide-react"
import { courses } from "@/lib/courses-data"
import { CourseService } from "@/lib/course-service"

export default function EnrolledCoursesPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // For demo purposes, we'll use a fixed user ID
  const userId = "user-123"

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userCourses = CourseService.getEnrolledCoursesForUser(userId, courses)
      setEnrolledCourses(userCourses)
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">My Courses</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted"></div>
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded mb-4"></div>
                <div className="h-4 bg-muted rounded mb-4 w-3/4"></div>
                <div className="h-2 bg-muted rounded mb-6"></div>
                <div className="h-10 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
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

      {enrolledCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No enrolled courses yet</h2>
          <p className="text-muted-foreground mb-6">Explore our catalog and enroll in courses to start learning</p>
          <Button asChild>
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrolledCourses.map((course) => {
            // Find the next lesson to continue
            let nextLesson = { moduleTitle: "", lessonTitle: "", moduleId: "", lessonId: "" }

            const enrollment = CourseService.getEnrollmentStatus(userId, course.id)

            if (enrollment) {
              for (const module of course.modules) {
                const incompleteLesson = module.lessons.find(
                  (lesson) => !enrollment.completedLessons.includes(lesson.id),
                )
                if (incompleteLesson) {
                  nextLesson = {
                    moduleTitle: module.title,
                    lessonTitle: incompleteLesson.title,
                    moduleId: module.id,
                    lessonId: incompleteLesson.id,
                  }
                  break
                }
              }
            }

            return (
              <div key={course.id} className="course-card overflow-hidden">
                <div className="relative">
                  <img
                    src={course.thumbnail || "/placeholder.svg"}
                    alt={course.title}
                    className="h-48 w-full object-cover"
                  />
                  <Badge className={`absolute left-2 top-2 bg-primary text-white`}>{course.category}</Badge>
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-lg font-bold">{course.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">{course.instructor.name}</p>

                  <div className="mb-4">
                    <div className="mb-1 flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{course.progress || 0}%</span>
                    </div>
                    <Progress value={course.progress || 0} className="h-2" />
                  </div>

                  {nextLesson.lessonId ? (
                    <div className="mb-4 rounded-lg bg-muted p-3">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-primary" />
                        <h4 className="text-sm font-medium">Next Lesson</h4>
                      </div>
                      <p className="mt-1 text-sm">{nextLesson.lessonTitle}</p>
                    </div>
                  ) : (
                    <div className="mb-4 rounded-lg bg-green-50 p-3">
                      <div className="flex items-center">
                        <BookOpen className="mr-2 h-4 w-4 text-green-500" />
                        <h4 className="text-sm font-medium text-green-700">Course Completed!</h4>
                      </div>
                    </div>
                  )}

                  <Button asChild className="w-full">
                    {nextLesson.lessonId ? (
                      <Link href={`/courses/${course.slug}/learn/${nextLesson.moduleId}/${nextLesson.lessonId}`}>
                        Continue
                      </Link>
                    ) : (
                      <Link href={`/courses/${course.slug}`}>Review Course</Link>
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
