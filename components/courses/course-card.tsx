"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Course } from "@/types"
import { ClockIcon } from "lucide-react"

interface CourseCardProps {
  course: Course
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/course/${course.slug}`}>
      <Card className="h-full overflow-hidden transition-all hover:shadow-md">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={course.thumbnailUrl || "/course-placeholder.png"}
            alt={course.title}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            {course.subject && (
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {course.subject.name}
              </Badge>
            )}
            {course.gradeLevel && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{course.gradeLevel.name}</span>
            )}
          </div>
          <h3 className="text-lg font-semibold line-clamp-2 mb-2">{course.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">{course.description}</p>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
            {course.durationMinutes && (
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>{Math.ceil(course.durationMinutes / 60)} hours</span>
              </div>
            )}
            {course.lessonCount !== undefined && (
              <div>
                <span>{course.lessonCount} lessons</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// Also export as named export to ensure compatibility
export { CourseCard }
