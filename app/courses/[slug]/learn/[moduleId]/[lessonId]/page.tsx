"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, VideoIcon } from "lucide-react"
import { getCourseBySlug } from "@/lib/courses-data"
import { CourseService } from "@/lib/course-service"

export default function LessonPage({
  params,
}: {
  params: { slug: string; moduleId: string; lessonId: string }
}) {
  const router = useRouter()
  const course = getCourseBySlug(params.slug)
  const [enrollmentStatus, setEnrollmentStatus] = useState<any>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  // For demo purposes, we'll use a fixed user ID
  const userId = "user-123"

  // Find the current module and lesson
  const currentModule = course?.modules.find((module) => module.id === params.moduleId)
  const currentLesson = currentModule?.lessons.find((lesson) => lesson.id === params.lessonId)

  // Get next and previous lessons for navigation
  const [nextLesson, setNextLesson] = useState<{ moduleId: string; lessonId: string } | null>(null)
  const [prevLesson, setPrevLesson] = useState<{ moduleId: string; lessonId: string } | null>(null)

  useEffect(() => {
    if (!course) return

    // Check enrollment status
    const status = CourseService.getEnrollmentStatus(userId, course.id)
    setEnrollmentStatus(status)

    if (status?.completedLessons.includes(params.lessonId)) {
      setIsCompleted(true)
    }

    // Find next and previous lessons
    let foundCurrent = false
    let prevLessonData = null
    let nextLessonData = null

    // Loop through all modules and lessons to find next and previous
    for (let i = 0; i < course.modules.length; i++) {
      const module = course.modules[i]

      for (let j = 0; j < module.lessons.length; j++) {
        const lesson = module.lessons[j]

        if (foundCurrent) {
          nextLessonData = { moduleId: module.id, lessonId: lesson.id }
          break
        }

        if (module.id === params.moduleId && lesson.id === params.lessonId) {
          foundCurrent = true
        } else {
          prevLessonData = { moduleId: module.id, lessonId: lesson.id }
        }
      }

      if (nextLessonData) break
    }

    setPrevLesson(prevLessonData)
    setNextLesson(nextLessonData)
  }, [course, params.moduleId, params.lessonId])

  if (!course || !currentModule || !currentLesson) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold">Lesson not found</h1>
        <p className="mt-4">The lesson you're looking for doesn't exist or has been removed.</p>
        <Button asChild className="mt-6">
          <Link href={`/courses/${params.slug}`}>Back to Course</Link>
        </Button>
      </div>
    )
  }

  // Mark lesson as completed
  const handleCompleteLesson = () => {
    const updatedStatus = CourseService.completeLessonForUser(userId, course.id, params.lessonId)
    if (updatedStatus) {
      setEnrollmentStatus(updatedStatus)
      setIsCompleted(true)
    }
  }

  // Navigate to next lesson
  const handleNextLesson = () => {
    if (!isCompleted) {
      handleCompleteLesson()
    }

    if (nextLesson) {
      router.push(`/courses/${params.slug}/learn/${nextLesson.moduleId}/${nextLesson.lessonId}`)
    } else {
      // If no next lesson, go back to course page
      router.push(`/courses/${params.slug}`)
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
            <BreadcrumbLink href={`/courses/${params.slug}`}>{course.title}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{currentLesson.title}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-3">
          <div className="mb-6">
            <Button variant="outline" size="sm" asChild className="mb-4">
              <Link href={`/courses/${params.slug}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Course
              </Link>
            </Button>

            <h1 className="text-2xl font-bold">{currentLesson.title}</h1>
            <p className="text-muted-foreground mt-2">{currentLesson.description}</p>
          </div>

          {/* Lesson Content */}
          <Card className="mb-6">
            <CardContent className="p-0">
              {currentLesson.type === "video" && (
                <div className="aspect-video bg-black flex items-center justify-center">
                  {currentLesson.videoUrl ? (
                    <div className="w-full h-full">
                      {/* In a real app, this would be a video player */}
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <VideoIcon className="h-16 w-16 text-muted-foreground" />
                        <span className="sr-only">Video Player</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-white">
                      <VideoIcon className="h-16 w-16 mx-auto mb-2" />
                      <p>Video content would appear here</p>
                    </div>
                  )}
                </div>
              )}

              {currentLesson.type === "quiz" && (
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <FileText className="h-6 w-6 mr-2 text-orange-500" />
                    <h2 className="text-xl font-bold">Quiz: {currentLesson.quiz?.title}</h2>
                  </div>
                  <p className="mb-4">{currentLesson.quiz?.description}</p>
                  <div className="bg-muted p-4 rounded-md mb-4">
                    <p className="font-medium">Quiz Details:</p>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li>Time Limit: {currentLesson.quiz?.timeLimit} minutes</li>
                      <li>Questions: {currentLesson.quiz?.questions}</li>
                      <li>Points: {currentLesson.quiz?.points}</li>
                    </ul>
                  </div>
                  <Button className="w-full">Start Quiz</Button>
                </div>
              )}

              {currentLesson.type === "assignment" && (
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <FileText className="h-6 w-6 mr-2 text-purple-500" />
                    <h2 className="text-xl font-bold">Assignment: {currentLesson.assignment?.title}</h2>
                  </div>
                  <p className="mb-4">{currentLesson.assignment?.description}</p>
                  <div className="bg-muted p-4 rounded-md mb-4">
                    <p className="font-medium">Assignment Details:</p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {currentLesson.assignment?.dueDate && (
                        <li>Due Date: {new Date(currentLesson.assignment.dueDate).toLocaleDateString()}</li>
                      )}
                      <li>Points: {currentLesson.assignment?.points}</li>
                    </ul>
                  </div>
                  <Button className="w-full">Submit Assignment</Button>
                </div>
              )}

              {currentLesson.type === "reading" && currentLesson.content && (
                <div className="p-6 prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                </div>
              )}

              {/* Lesson Resources */}
              {currentLesson.resources && currentLesson.resources.length > 0 && (
                <div className="p-6 border-t">
                  <h3 className="font-medium mb-4">Lesson Resources</h3>
                  <div className="space-y-2">
                    {currentLesson.resources.map((resource) => (
                      <div key={resource.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-3 text-blue-500" />
                          <div>
                            <p className="font-medium">{resource.title}</p>
                            {resource.size && <p className="text-xs text-muted-foreground">{resource.size}</p>}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              disabled={!prevLesson}
              onClick={() => {
                if (prevLesson) {
                  router.push(`/courses/${params.slug}/learn/${prevLesson.moduleId}/${prevLesson.lessonId}`)
                }
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous Lesson
            </Button>
            <Button onClick={handleNextLesson}>
              {isCompleted ? (nextLesson ? "Next Lesson" : "Back to Course") : "Complete & Continue"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
              <CardDescription>
                {enrollmentStatus?.completedLessons.length || 0} of{" "}
                {course.modules.reduce((acc, module) => acc + module.lessons.length, 0)} lessons completed
              </CardDescription>
              <Progress
                value={
                  enrollmentStatus
                    ? (enrollmentStatus.completedLessons.length /
                        course.modules.reduce((acc, module) => acc + module.lessons.length, 0)) *
                      100
                    : 0
                }
                className="h-2 mt-2"
              />
            </CardHeader>
            <CardContent className="max-h-[calc(100vh-300px)] overflow-y-auto">
              <div className="space-y-4">
                {course.modules.map((module) => (
                  <div key={module.id}>
                    <h3 className="font-medium mb-2">{module.title}</h3>
                    <ul className="space-y-1">
                      {module.lessons.map((lesson) => {
                        const isCurrentLesson = lesson.id === params.lessonId
                        const isLessonCompleted = enrollmentStatus?.completedLessons.includes(lesson.id)

                        return (
                          <li key={lesson.id}>
                            <Link
                              href={`/courses/${params.slug}/learn/${module.id}/${lesson.id}`}
                              className={`flex items-center p-2 text-sm rounded-md ${
                                isCurrentLesson
                                  ? "bg-primary text-primary-foreground"
                                  : isLessonCompleted
                                    ? "text-muted-foreground"
                                    : ""
                              }`}
                            >
                              {isLessonCompleted ? (
                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                              ) : lesson.type === "video" ? (
                                <VideoIcon className="h-4 w-4 mr-2 text-blue-500" />
                              ) : (
                                <FileText className="h-4 w-4 mr-2 text-orange-500" />
                              )}
                              <span className={isLessonCompleted && !isCurrentLesson ? "line-through" : ""}>
                                {lesson.title}
                              </span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
