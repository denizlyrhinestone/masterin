"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, BookOpen, CheckCircle2, Clock, Download, FileText, Play, Star, Users, Video } from "lucide-react"
import { getCourseBySlug } from "@/lib/courses-data"
import { CourseService } from "@/lib/course-service"

export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const course = getCourseBySlug(params.slug)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrollmentStatus, setEnrollmentStatus] = useState<any>(null)

  // For demo purposes, we'll use a fixed user ID
  const userId = "user-123"

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

  // Check if user is enrolled
  useEffect(() => {
    if (typeof window !== "undefined") {
      const status = CourseService.getEnrollmentStatus(userId, course.id)
      setEnrollmentStatus(status)
      setIsEnrolled(!!status?.enrolled)
    }
  }, [course.id, userId])

  // Handle enrollment
  const handleEnroll = () => {
    const status = CourseService.enrollUserInCourse(userId, course.id)
    setEnrollmentStatus(status)
    setIsEnrolled(true)
  }

  // Find the next incomplete lesson
  let nextLesson = { moduleId: "", lessonId: "", title: "" }
  if (isEnrolled && enrollmentStatus) {
    for (const module of course.modules) {
      const incompleteLesson = module.lessons.find((lesson) => !enrollmentStatus.completedLessons.includes(lesson.id))
      if (incompleteLesson) {
        nextLesson = {
          moduleId: module.id,
          lessonId: incompleteLesson.id,
          title: incompleteLesson.title,
        }
        break
      }
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Breadcrumb className="mb-6">
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
              <Card>
                <CardHeader>
                  <CardTitle>Course Curriculum</CardTitle>
                  <CardDescription>
                    {course.modules.length} modules •{" "}
                    {course.modules.reduce((acc, module) => acc + module.lessons.length, 0)} lessons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {course.modules.map((module, moduleIndex) => (
                      <AccordionItem key={module.id} value={module.id}>
                        <AccordionTrigger className="hover:bg-muted/50 px-4 py-2 rounded-md">
                          <div className="flex items-center text-left">
                            <span className="font-medium">{module.title}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({module.lessons.length} lessons)
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4">
                          <div className="space-y-2 mt-2">
                            {module.lessons.map((lesson, lessonIndex) => {
                              const isCompleted = enrollmentStatus?.completedLessons.includes(lesson.id)
                              const isNextLesson = nextLesson.lessonId === lesson.id

                              return (
                                <div
                                  key={lesson.id}
                                  className={`flex items-center justify-between p-3 rounded-md ${
                                    isCompleted ? "bg-muted/50" : "bg-muted"
                                  } ${isNextLesson ? "border border-primary" : ""}`}
                                >
                                  <div className="flex items-center">
                                    {isCompleted ? (
                                      <CheckCircle2 className="h-5 w-5 mr-3 text-green-500" />
                                    ) : lesson.type === "video" ? (
                                      <Video className="h-5 w-5 mr-3 text-blue-500" />
                                    ) : lesson.type === "quiz" ? (
                                      <FileText className="h-5 w-5 mr-3 text-orange-500" />
                                    ) : lesson.type === "assignment" ? (
                                      <FileText className="h-5 w-5 mr-3 text-purple-500" />
                                    ) : (
                                      <BookOpen className="h-5 w-5 mr-3 text-primary" />
                                    )}
                                    <div>
                                      <p className="font-medium">{lesson.title}</p>
                                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {lesson.duration}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant={isCompleted ? "outline" : "default"}
                                    disabled={!isEnrolled}
                                    onClick={() => {
                                      if (isEnrolled) {
                                        router.push(`/courses/${course.slug}/learn/${module.id}/${lesson.id}`)
                                      }
                                    }}
                                  >
                                    {isCompleted ? "Review" : "Start"}
                                  </Button>
                                </div>
                              )
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Objectives</CardTitle>
                  <CardDescription>What you'll learn in this course</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.learningObjectives.map((objective) => (
                      <li key={objective.id} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                        <span>{objective.description}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructor" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Meet Your Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={course.instructor.avatar || "/placeholder.svg"} alt={course.instructor.name} />
                      <AvatarFallback>{course.instructor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold">{course.instructor.name}</h3>
                      <p className="text-muted-foreground">{course.instructor.title}</p>
                      <p className="mt-4">{course.instructor.bio}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Resources</CardTitle>
                  <CardDescription>Download materials to help with your studies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {course.resources.map((resource) => (
                      <div key={resource.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-3 text-blue-500" />
                          <div>
                            <p className="font-medium">{resource.title}</p>
                            <p className="text-xs text-muted-foreground">{resource.description}</p>
                            {resource.size && <p className="text-xs text-muted-foreground">{resource.size}</p>}
                          </div>
                        </div>
                        <Button size="sm" variant="outline" disabled={!isEnrolled}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEnrolled ? (
                <>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Your Progress</span>
                      <span>{enrollmentStatus?.progress || 0}%</span>
                    </div>
                    <Progress value={enrollmentStatus?.progress || 0} className="h-2" />
                  </div>

                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex items-center">
                      <Play className="h-4 w-4 mr-2 text-primary" />
                      <h4 className="text-sm font-medium">Continue Learning</h4>
                    </div>
                    <p className="mt-1 text-sm">{nextLesson.title || "Course completed!"}</p>
                    <Button
                      className="w-full mt-4"
                      disabled={!nextLesson.lessonId}
                      onClick={() => {
                        if (nextLesson.moduleId && nextLesson.lessonId) {
                          router.push(`/courses/${course.slug}/learn/${nextLesson.moduleId}/${nextLesson.lessonId}`)
                        }
                      }}
                    >
                      {nextLesson.lessonId ? "Continue" : "Review Course"}
                    </Button>
                  </div>
                </>
              ) : (
                <Button className="w-full" onClick={handleEnroll}>
                  Enroll Now
                </Button>
              )}

              <div className="space-y-3">
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
