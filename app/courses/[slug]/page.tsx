"use client"

import { Progress } from "@/components/ui/progress"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import { ArrowLeft, BookOpen, Clock, Play, Star, Users } from "lucide-react"
import { ApiService } from "@/lib/api-service"
import { CourseService } from "@/lib/course-service"
import { progressService } from "@/lib/progress-service"
import { InstructorProfileEnhanced } from "@/components/instructor-profile-enhanced"
import { CourseCurriculumEnhanced } from "@/components/course-curriculum-enhanced"
import { toast } from "@/components/ui/use-toast"
import type { Course } from "@/lib/courses-data"

export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [progress, setProgress] = useState<any>(null)
  const [instructorCourses, setInstructorCourses] = useState<Course[]>([])

  // For demo purposes, we'll use a fixed user ID
  const userId = "user-123"

  // Load course data
  useEffect(() => {
    const loadCourseData = async () => {
      setIsLoading(true)
      try {
        // Get course data
        const courseData = await ApiService.getCourseById(params.slug)
        setCourse(courseData)

        if (courseData) {
          // Check if user is enrolled
          const enrollmentStatus = CourseService.getEnrollmentStatus(userId, courseData.id)
          setIsEnrolled(!!enrollmentStatus?.enrolled)

          // Get progress data
          const progressData = progressService.getProgress(userId, courseData.id)
          setProgress(progressData)

          // Get instructor's other courses
          const instructorCourses = await ApiService.getInstructorCourses(courseData.instructor.id)
          setInstructorCourses(instructorCourses.filter((c) => c.id !== courseData.id))
        }
      } catch (error) {
        console.error("Error loading course data:", error)
        toast({
          title: "Error",
          description: "Failed to load course data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadCourseData()
  }, [params.slug])

  // Handle enrollment
  const handleEnroll = async () => {
    if (!course) return

    try {
      const success = await ApiService.enrollInCourse(userId, course.id)

      if (success) {
        setIsEnrolled(true)
        const progressData = progressService.getProgress(userId, course.id)
        setProgress(progressData)

        toast({
          title: "Enrolled Successfully",
          description: `You are now enrolled in ${course.title}`,
        })
      }
    } catch (error) {
      console.error("Error enrolling in course:", error)
      toast({
        title: "Enrollment Failed",
        description: "There was an error enrolling in this course. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Find the next incomplete lesson for "Continue Learning"
  const getNextLesson = () => {
    if (!course || !progress) return null

    // If there's a last accessed lesson, use that
    if (progress.lastAccessedLessonId && progress.lastAccessedModuleId) {
      return {
        moduleId: progress.lastAccessedModuleId,
        lessonId: progress.lastAccessedLessonId,
      }
    }

    // Otherwise find the first incomplete lesson
    for (const module of course.modules) {
      const incompleteLesson = module.lessons.find((lesson) => !progress.completedLessons.includes(lesson.id))

      if (incompleteLesson) {
        return {
          moduleId: module.id,
          lessonId: incompleteLesson.id,
        }
      }
    }

    // If all lessons are complete, return the first lesson
    if (course.modules.length > 0 && course.modules[0].lessons.length > 0) {
      return {
        moduleId: course.modules[0].id,
        lessonId: course.modules[0].lessons[0].id,
      }
    }

    return null
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-muted rounded w-48"></div>
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold">Course not found</h1>
        <p className="mt-4">The course you're looking for doesn't exist or has been removed.</p>
        <Button asChild className="mt-6">
          <Link href="/courses">Back to Courses</Link>
        </Button>
      </div>
    )
  }

  const nextLesson = getNextLesson()

  return (
    <div className="container mx-auto p-6">
      <Breadcrumb className="mb-4 md:mb-6 overflow-auto whitespace-nowrap">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/courses">Courses</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{course.title}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/courses">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Link>
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <img
            src={course.thumbnail || "/placeholder.svg"}
            alt={course.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />

          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge className="bg-primary text-white">{course.category}</Badge>
              <Badge variant="outline">{course.level}</Badge>
              {course.featured && <Badge className="bg-secondary text-white">Featured</Badge>}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <p className="text-xl text-muted-foreground mt-1">{course.subtitle}</p>
            <p className="text-muted-foreground mt-4">{course.longDescription}</p>
          </div>

          <Tabs defaultValue="curriculum">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="curriculum" className="mt-6">
              <CourseCurriculumEnhanced
                course={course}
                userId={userId}
                isEnrolled={isEnrolled}
                onEnroll={handleEnroll}
              />
            </TabsContent>

            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-bold mb-4">Learning Objectives</h2>
                  <ul className="space-y-2 mb-6">
                    {course.learningObjectives.map((objective) => (
                      <li key={objective.id} className="flex items-start">
                        <div className="mr-2 mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        </div>
                        <span>{objective.description}</span>
                      </li>
                    ))}
                  </ul>

                  <h2 className="text-xl font-bold mb-4">What You'll Learn</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Course Structure</h3>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center">
                          <div className="mr-2 h-1.5 w-1.5 rounded-full bg-primary"></div>
                          <span>{course.modules.length} modules</span>
                        </li>
                        <li className="flex items-center">
                          <div className="mr-2 h-1.5 w-1.5 rounded-full bg-primary"></div>
                          <span>{course.modules.reduce((acc, module) => acc + module.lessons.length, 0)} lessons</span>
                        </li>
                        <li className="flex items-center">
                          <div className="mr-2 h-1.5 w-1.5 rounded-full bg-primary"></div>
                          <span>{course.duration} total duration</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Requirements</h3>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center">
                          <div className="mr-2 h-1.5 w-1.5 rounded-full bg-primary"></div>
                          <span>No prior knowledge required</span>
                        </li>
                        <li className="flex items-center">
                          <div className="mr-2 h-1.5 w-1.5 rounded-full bg-primary"></div>
                          <span>Basic computer skills</span>
                        </li>
                        <li className="flex items-center">
                          <div className="mr-2 h-1.5 w-1.5 rounded-full bg-primary"></div>
                          <span>Internet connection for video content</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructor" className="mt-6">
              <InstructorProfileEnhanced instructor={course.instructor} courses={instructorCourses} />
            </TabsContent>

            <TabsContent value="resources" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-bold mb-4">Course Resources</h2>
                  <div className="space-y-4">
                    {course.resources.map((resource) => (
                      <div key={resource.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center mr-3">
                            {resource.type === "pdf" && <BookOpen className="h-5 w-5 text-primary" />}
                            {resource.type === "video" && <Play className="h-5 w-5 text-primary" />}
                            {resource.type === "link" && <Link className="h-5 w-5 text-primary" />}
                          </div>
                          <div>
                            <p className="font-medium">{resource.title}</p>
                            <p className="text-xs text-muted-foreground">{resource.description}</p>
                            {resource.size && <p className="text-xs text-muted-foreground">{resource.size}</p>}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!isEnrolled}
                          onClick={() => {
                            toast({
                              title: "Download Started",
                              description: `Downloading ${resource.title}...`,
                            })
                          }}
                        >
                          {resource.type === "link" ? "Visit" : "Download"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="order-first md:order-last mb-6 md:mb-0">
          <Card className="md:sticky md:top-6">
            <CardContent className="p-6 space-y-6">
              {isEnrolled ? (
                <>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Your Progress</span>
                      <span>{progress?.overallProgress || 0}%</span>
                    </div>
                    <Progress value={progress?.overallProgress || 0} className="h-2" />
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex items-center">
                      <Play className="h-4 w-4 mr-2 text-primary" />
                      <h4 className="text-sm font-medium">Continue Learning</h4>
                    </div>
                    <p className="mt-1 text-sm">
                      {nextLesson
                        ? course.modules
                            .find((m) => m.id === nextLesson.moduleId)
                            ?.lessons.find((l) => l.id === nextLesson.lessonId)?.title
                        : "Course completed!"}
                    </p>
                    <Button className="w-full mt-4" disabled={!nextLesson} asChild={!!nextLesson}>
                      {nextLesson ? (
                        <Link href={`/courses/${course.id}/learn/${nextLesson.moduleId}/${nextLesson.lessonId}`}>
                          Continue
                        </Link>
                      ) : (
                        <span>Review Course</span>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">
                      {course.price ? `$${course.price.toFixed(2)}` : "Free"}
                    </div>
                    <Button className="w-full" onClick={handleEnroll}>
                      Enroll Now
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">Full access to all course materials</p>
                  </div>
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">This course includes:</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        </div>
                        <span>{course.duration} of content</span>
                      </li>
                      <li className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        </div>
                        <span>{course.modules.length} modules</span>
                      </li>
                      <li className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        </div>
                        <span>{course.resources.length} downloadable resources</span>
                      </li>
                      <li className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        </div>
                        <span>Full lifetime access</span>
                      </li>
                      <li className="flex items-center">
                        <div className="mr-2 h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                        </div>
                        <span>Certificate of completion</span>
                      </li>
                    </ul>
                  </div>
                </>
              )}

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Instructor</span>
                  </div>
                  <span className="text-sm font-medium">{course.instructor.name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <span className="text-sm font-medium">{course.duration}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Students</span>
                  </div>
                  <span className="text-sm font-medium">{course.enrollmentCount.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-2 text-amber-500" />
                    <span className="text-sm">Rating</span>
                  </div>
                  <span className="text-sm font-medium">
                    {course.rating}/5 ({course.reviewCount} reviews)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
