"use client"

import { useState } from "react"
import { PlayCircle, FileText, FileQuestion, BookOpen, Lock, Unlock } from "lucide-react"
import type { CourseCurriculum, CourseLesson } from "@/types/course"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

interface CourseCurriculumProps {
  curriculum: CourseCurriculum
  isPurchased?: boolean
}

export function CourseCurriculum({ curriculum, isPurchased = false }: CourseCurriculumProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>([curriculum.modules[0]?.id || ""])

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]))
  }

  const toggleAllModules = () => {
    if (expandedModules.length === curriculum.modules.length) {
      setExpandedModules([])
    } else {
      setExpandedModules(curriculum.modules.map((module) => module.id))
    }
  }

  const getLessonIcon = (type: CourseLesson["type"]) => {
    switch (type) {
      case "video":
        return <PlayCircle className="h-4 w-4 mr-2" />
      case "quiz":
        return <FileQuestion className="h-4 w-4 mr-2" />
      case "assignment":
        return <FileText className="h-4 w-4 mr-2" />
      case "reading":
        return <BookOpen className="h-4 w-4 mr-2" />
      default:
        return <PlayCircle className="h-4 w-4 mr-2" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div>
          <h3 className="text-xl font-semibold">Course Content</h3>
          <p className="text-muted-foreground">
            {curriculum.modules.length} modules • {curriculum.totalLessons} lessons • {curriculum.totalDuration} total
            length
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={toggleAllModules}>
          {expandedModules.length === curriculum.modules.length ? "Collapse All" : "Expand All"}
        </Button>
      </div>

      <Accordion type="multiple" value={expandedModules} className="border rounded-md">
        {curriculum.modules.map((module, index) => (
          <AccordionItem key={module.id} value={module.id} className="border-b last:border-b-0">
            <AccordionTrigger
              onClick={() => toggleModule(module.id)}
              className="px-4 py-3 hover:no-underline hover:bg-muted/50 data-[state=open]:bg-muted/50"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full text-left">
                <div>
                  <span className="font-medium">{module.title}</span>
                  {module.description && <p className="text-sm text-muted-foreground mt-1">{module.description}</p>}
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <span className="text-sm text-muted-foreground">{module.lessons.length} lessons</span>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{module.duration}</span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-0">
              <ul className="divide-y">
                {module.lessons.map((lesson, lessonIndex) => (
                  <li key={lesson.id} className="px-4 py-3 hover:bg-muted/30">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className="flex items-center mt-0.5">{getLessonIcon(lesson.type)}</div>
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium">{lesson.title}</span>
                            {lesson.isFree && (
                              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                                Free Preview
                              </Badge>
                            )}
                          </div>
                          {lesson.description && (
                            <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                        {!isPurchased && !lesson.isFree ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Unlock className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
