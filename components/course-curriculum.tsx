"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Clock, Download, FileText, Lock, Video } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Course } from "@/lib/courses-data"
import type { EnrollmentStatus } from "@/lib/course-service"

interface CourseCurriculumProps {
  course: Course
  enrollmentStatus: EnrollmentStatus | null
  isEnrolled: boolean
  onEnroll: () => void
}

export function CourseCurriculum({ course, enrollmentStatus, isEnrolled, onEnroll }: CourseCurriculumProps) {
  const router = useRouter()
  const [expandedModules, setExpandedModules] = useState<string[]>([course.modules[0]?.id || ""])

  // Calculate total course duration
  const totalDuration = course.modules.reduce((total, module) => {
    return (
      total +
      module.lessons.reduce((moduleTotal, lesson) => {
        const minutes = Number.parseInt(lesson.duration.split(" ")[0])
        return moduleTotal + (isNaN(minutes) ? 0 : minutes)
      }, 0)
    )
  }, 0)

  // Calculate total lessons
  const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0)

  // Toggle module expansion
  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Course Curriculum</CardTitle>
            <CardDescription>
              {course.modules.length} modules • {totalLessons} lessons • {totalDuration} minutes total
            </CardDescription>
          </div>

          {!isEnrolled && <Button onClick={onEnroll}>Enroll Now</Button>}

          {isEnrolled && enrollmentStatus && (
            <div className="flex items-center gap-2">
              <Progress value={enrollmentStatus.progress} className="w-32 h-2" />
              <span className="text-sm font-medium">{enrollmentStatus.progress}% complete</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" value={expandedModules} className="w-full">
          {course.modules.map((module, moduleIndex) => {
            // Calculate module progress
            const moduleLessonsCompleted = module.lessons.filter((lesson) =>
              enrollmentStatus?.completedLessons.includes(lesson.id),
            ).length

            const moduleProgress =
              module.lessons.length > 0 ? Math.round((moduleLessonsCompleted / module.lessons.length) * 100) : 0

            return (
              <AccordionItem key={module.id} value={module.id}>
                <AccordionTrigger
                  onClick={() => toggleModule(module.id)}
                  className="hover:bg-muted/50 px-4 py-3 rounded-md group"
                >
                  <div className="flex flex-1 items-center text-left">
                    <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-medium">{moduleIndex + 1}</span>
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">{module.title}</span>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <span>{module.lessons.length} lessons</span>
                        {isEnrolled && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{moduleLessonsCompleted} completed</span>
                          </>
                        )}
                      </div>
                    </div>

                    {isEnrolled && (
                      <div className="hidden md:flex items-center mr-8 gap-2">
                        <Progress value={moduleProgress} className="w-20 h-2" />
                        <span className="text-xs">{moduleProgress}%</span>
                      </div>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-2 pb-4">
                  <div className="space-y-2 ml-12">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const isCompleted = enrollmentStatus?.completedLessons.includes(lesson.id)

                      return (
                        <div
                          key={lesson.id}
                          className={`flex items-center justify-between p-3 rounded-md ${
                            isCompleted ? "bg-muted/50" : "bg-muted"
                          }`}
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
                              <FileText className="h-5 w-5 mr-3 text-primary" />
                            )}
                            <div>
                              <div className="flex items-center">
                                <p className="font-medium">{lesson.title}</p>
                                {lesson.type === "quiz" && (
                                  <Badge variant="outline" className="ml-2">
                                    Quiz
                                  </Badge>
                                )}
                                {lesson.type === "assignment" && (
                                  <Badge variant="outline" className="ml-2">
                                    Assignment
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{lesson.duration}</span>

                                {lesson.resources && lesson.resources.length > 0 && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <Download className="h-3 w-3 mr-1" />
                                    <span>
                                      {lesson.resources.length} resource{lesson.resources.length !== 1 ? "s" : ""}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isEnrolled ? (
                              <Button
                                size="sm"
                                variant={isCompleted ? "outline" : "default"}
                                onClick={() => {
                                  router.push(`/courses/${course.slug}/learn/${module.id}/${lesson.id}`)
                                }}
                              >
                                {isCompleted ? "Review" : "Start"}
                              </Button>
                            ) : (
                              <Button size="sm" variant="ghost" disabled>
                                <Lock className="h-4 w-4 mr-2" />
                                Locked
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </CardContent>
    </Card>
  )
}
