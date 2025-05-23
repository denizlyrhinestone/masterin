"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle, Clock, Lock, PlayCircle } from "lucide-react"

// Sample course content data
const modules = [
  {
    id: "module-1",
    title: "Getting Started",
    lessons: [
      {
        id: "lesson-1",
        title: "Introduction to the Course",
        duration: "10 min",
        isCompleted: true,
        isLocked: false,
      },
      {
        id: "lesson-2",
        title: "Setting Up Your Environment",
        duration: "15 min",
        isCompleted: true,
        isLocked: false,
      },
      {
        id: "lesson-3",
        title: "Basic Concepts",
        duration: "20 min",
        isCompleted: false,
        isLocked: false,
      },
    ],
  },
  {
    id: "module-2",
    title: "Core Principles",
    lessons: [
      {
        id: "lesson-4",
        title: "Understanding the Fundamentals",
        duration: "25 min",
        isCompleted: false,
        isLocked: false,
      },
      {
        id: "lesson-5",
        title: "Advanced Techniques",
        duration: "30 min",
        isCompleted: false,
        isLocked: true,
      },
      {
        id: "lesson-6",
        title: "Practical Applications",
        duration: "35 min",
        isCompleted: false,
        isLocked: true,
      },
    ],
  },
]

export function CourseContent() {
  const [expandedModules, setExpandedModules] = useState<string[]>(["module-1"])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Course Content</h2>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            <span>2 hours of content</span>
          </div>
          <div className="flex items-center">
            <PlayCircle className="h-4 w-4 mr-2" />
            <span>6 lessons</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span>2 completed</span>
          </div>
        </div>
      </div>

      <Accordion type="multiple" value={expandedModules} onValueChange={setExpandedModules} className="space-y-4">
        {modules.map((module) => (
          <AccordionItem key={module.id} value={module.id} className="border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="flex items-center">
                <span className="font-medium">{module.title}</span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({module.lessons.length} lessons)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-0">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {module.lessons.map((lesson) => (
                  <li key={lesson.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {lesson.isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        ) : lesson.isLocked ? (
                          <Lock className="h-5 w-5 text-gray-400 mr-3" />
                        ) : (
                          <PlayCircle className="h-5 w-5 text-blue-500 mr-3" />
                        )}
                        <span className={lesson.isLocked ? "text-gray-400" : ""}>{lesson.title}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400 mr-4">{lesson.duration}</span>
                        {!lesson.isLocked && (
                          <Link href="/courses/course-detail/lesson">
                            <Button size="sm" variant={lesson.isCompleted ? "outline" : "default"}>
                              {lesson.isCompleted ? "Review" : "Start"}
                            </Button>
                          </Link>
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
