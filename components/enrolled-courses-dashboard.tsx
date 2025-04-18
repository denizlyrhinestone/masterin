"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, Calendar, CheckCircle, Clock, Star } from "lucide-react"
import type { Course } from "@/lib/courses-data"

interface EnrolledCoursesDashboardProps {
  enrolledCourses: Course[]
  completedCourses: Course[]
  inProgressCourses: Course[]
}

export function EnrolledCoursesDashboard({
  enrolledCourses,
  completedCourses,
  inProgressCourses,
}: EnrolledCoursesDashboardProps) {
  const router = useRouter()

  // Calculate overall progress across all courses
  const totalLessons = enrolledCourses.reduce((total, course) => {
    return total + course.modules.reduce((moduleTotal, module) => moduleTotal + module.lessons.length, 0)
  }, 0)

  const completedLessons = enrolledCourses.reduce((total, course) => {
    return (
      total +
      ((course.progress || 0) / 100) *
        course.modules.reduce((moduleTotal, module) => moduleTotal + module.lessons.length, 0)
    )
  }, 0)

  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  // Find the most recently accessed course
  const mostRecentCourse = inProgressCourses.length > 0 ? inProgressCourses[0] : null

  return (
    <div className="space-y-6">
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
                <span className="text-sm font-medium">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {Math.round(completedLessons)} of {totalLessons} lessons completed
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
                <p className="text-xs text-muted-foreground">{Math.round(totalLessons * 0.3)} hours total</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {mostRecentCourse && (
        <Card>
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={mostRecentCourse.thumbnail || "/placeholder.svg"}
                alt={mostRecentCourse.title}
                className="rounded-lg w-full md:w-48 h-32 object-cover"
              />

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold">{mostRecentCourse.title}</h3>
                  <Badge variant="outline">{mostRecentCourse.level}</Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{mostRecentCourse.description}</p>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Your Progress</span>
                    <span>{mostRecentCourse.progress || 0}%</span>
                  </div>
                  <Progress value={mostRecentCourse.progress || 0} className="h-2" />
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Last accessed 2 days ago</span>
                  </div>

                  <Button onClick={() => router.push(`/courses/${mostRecentCourse.slug}`)}>Continue Learning</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                <CourseCard key={course.id} course={course} status="in-progress" />
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
                <CourseCard key={course.id} course={course} status="completed" />
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
                status={course.progress === 100 ? "completed" : "in-progress"}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface CourseCardProps {
  course: Course
  status: "in-progress" | "completed"
}

function CourseCard({ course, status }: CourseCardProps) {
  return (
    <div className="course-card overflow-hidden">
      <div className="relative">
        <img src={course.thumbnail || "/placeholder.svg"} alt={course.title} className="h-48 w-full object-cover" />
        <Badge className={`absolute left-2 top-2 bg-primary text-white`}>{course.category}</Badge>
        {status === "completed" && (
          <div className="absolute right-2 top-2">
            <Badge className="bg-green-500 text-white">Completed</Badge>
          </div>
        )}
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
          <Link href={`/courses/${course.slug}`}>{status === "completed" ? "Review Course" : "Continue Learning"}</Link>
        </Button>
      </div>
    </div>
  )
}
