"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Calendar, CheckCircle, Clock, Star } from "lucide-react"
import { CourseService } from "@/lib/course-service"
import { progressService, type ProgressData } from "@/lib/progress-service"
import type { Course } from "@/lib/courses-data"

interface StudentDashboardProps {
  userId: string
}

export function StudentDashboard({ userId }: StudentDashboardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])
  const [progressData, setProgressData] = useState<Record<string, ProgressData>>({})
  const [recentCourse, setRecentCourse] = useState<Course | null>(null)

  // Load enrolled courses and progress data
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true)

      // Get all courses
      const allCourses = CourseService.getAllCourses()

      // Get enrolled courses for user
      const userCourses = CourseService.getEnrolledCoursesForUser(userId, allCourses)
      setEnrolledCourses(userCourses)

      // Get progress data for all courses
      const progress = progressService.getAllUserProgress(userId)
      setProgressData(progress)

      // Find most recently accessed course
      if (userCourses.length > 0) {
        let mostRecent = userCourses[0]
        let mostRecentTime = new Date(0).toISOString()

        Object.values(progress).forEach((data) => {
          if (data.lastAccessedAt > mostRecentTime) {
            mostRecentTime = data.lastAccessedAt
            const course = userCourses.find((c) => c.id === data.courseId)
            if (course) {
              mostRecent = course
            }
          }
        })

        setRecentCourse(mostRecent)
      }

      setIsLoading(false)
    }

    loadData()
  }, [userId])

  // Filter courses by completion status
  const completedCourses = enrolledCourses.filter((course) => progressData[course.id]?.overallProgress === 100)

  const inProgressCourses = enrolledCourses.filter(
    (course) => progressData[course.id]?.overallProgress < 100 || !progressData[course.id],
  )

  // Calculate overall progress across all courses
  const calculateOverallProgress = () => {
    if (enrolledCourses.length === 0) return 0

    const totalProgress = enrolledCourses.reduce((sum, course) => {
      return sum + (progressData[course.id]?.overallProgress || 0)
    }, 0)

    return Math.round(totalProgress / enrolledCourses.length)
  }

  // Get continue learning link for most recent course
  const getContinueLearningLink = () => {
    if (!recentCourse) return "/courses"

    const progress = progressData[recentCourse.id]

    if (progress?.lastAccessedModuleId && progress?.lastAccessedLessonId) {
      return `/courses/${recentCourse.id}/learn/${progress.lastAccessedModuleId}/${progress.lastAccessedLessonId}`
    }

    return `/courses/${recentCourse.id}`
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">My Learning Dashboard</h1>
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
        <h1 className="text-3xl font-bold tracking-tight">My Learning Dashboard</h1>
        <p className="text-muted-foreground">Track your progress and continue learning</p>
      </div>

      <div className="space-y-6">
        {/* Progress Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
            <CardDescription>Track your overall learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm font-medium">{calculateOverallProgress()}%</span>
                </div>
                <Progress value={calculateOverallProgress()} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {completedCourses.length} of {enrolledCourses.length} courses completed
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{enrolledCourses.length} Enrolled Courses</p>
                  <p className="text-xs text-muted-foreground">
                    {completedCourses.length} completed, {inProgressCourses.length} in progress
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Learning Time</p>
                  <p className="text-xs text-muted-foreground">
                    {enrolledCourses.reduce((total, course) => {
                      // Estimate hours based on course duration (e.g., "8 weeks" → 8 hours)
                      const durationMatch = course.duration.match(/(\d+)/)
                      return total + (durationMatch ? Number.parseInt(durationMatch[1]) : 0)
                    }, 0)}{" "}
                    hours total
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Continue Learning Card */}
        {recentCourse && (
          <Card>
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
              <CardDescription>Pick up where you left off</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <img
                  src={recentCourse.thumbnail || "/placeholder.svg"}
                  alt={recentCourse.title}
                  className="rounded-lg w-full md:w-48 h-32 object-cover"
                />

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold">{recentCourse.title}</h3>
                    <Badge variant="outline">{recentCourse.level}</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{recentCourse.description}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Your Progress</span>
                      <span>{progressData[recentCourse.id]?.overallProgress || 0}%</span>
                    </div>
                    <Progress value={progressData[recentCourse.id]?.overallProgress || 0} className="h-2" />
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        Last accessed{" "}
                        {progressData[recentCourse.id]?.lastAccessedAt
                          ? new Date(progressData[recentCourse.id].lastAccessedAt).toLocaleDateString()
                          : "recently"}
                      </span>
                    </div>

                    <Button onClick={() => router.push(getContinueLearningLink())}>Continue Learning</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Courses Tabs */}
        <Tabs defaultValue="in-progress">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All Courses</TabsTrigger>
          </TabsList>

          <TabsContent value="in-progress" className="mt-6">
            {inProgressCourses.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No courses in progress</h3>
                <p className="text-muted-foreground mb-6">Start learning to see your courses here</p>
                <Button asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {inProgressCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    progress={progressData[course.id]?.overallProgress || 0}
                    status="in-progress"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedCourses.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No completed courses yet</h3>
                <p className="text-muted-foreground mb-6">Complete your courses to see them here</p>
                <Button asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {completedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} progress={100} status="completed" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  progress={progressData[course.id]?.overallProgress || 0}
                  status={progressData[course.id]?.overallProgress === 100 ? "completed" : "in-progress"}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface CourseCardProps {
  course: Course
  progress: number
  status: "in-progress" | "completed"
}

function CourseCard({ course, progress, status }: CourseCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      <div className="relative">
        <img src={course.thumbnail || "/placeholder.svg"} alt={course.title} className="h-48 w-full object-cover" />
        <Badge className={`absolute left-2 top-2 bg-primary text-white`}>{course.category}</Badge>
        {status === "completed" && (
          <div className="absolute right-2 top-2">
            <Badge className="bg-green-500 text-white">Completed</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <h3 className="mb-2 text-lg font-bold">{course.title}</h3>
        <p className="mb-4 text-sm text-muted-foreground">{course.instructor.name}</p>

        <div className="mb-4">
          <div className="mb-1 flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="mb-4 flex items-center justify-between text-sm">
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center">
            <Star className="mr-1 h-4 w-4 text-amber-500" />
            <span>{course.rating}</span>
          </div>
        </div>

        <Button asChild className="w-full">
          <Link href={`/courses/${course.id}`}>{status === "completed" ? "Review Course" : "Continue Learning"}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
