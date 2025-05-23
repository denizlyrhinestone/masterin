"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface LessonNavigationProps {
  courseSlug: string
  prevLesson?: {
    slug: string
    title: string
  }
  nextLesson?: {
    slug: string
    title: string
  }
  onComplete?: () => void
  isCompleted?: boolean
}

export default function LessonNavigation({
  courseSlug,
  prevLesson,
  nextLesson,
  onComplete,
  isCompleted = false,
}: LessonNavigationProps) {
  return (
    <div className="flex items-center justify-between border-t pt-4 mt-6">
      <div>
        {prevLesson ? (
          <Button variant="outline" asChild>
            <Link href={`/courses/${courseSlug}/lessons/${prevLesson.slug}`}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              {prevLesson.title}
            </Link>
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link href={`/courses/${courseSlug}`}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Link>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onComplete && !isCompleted && <Button onClick={onComplete}>Mark as Complete</Button>}

        {nextLesson && (
          <Button variant={isCompleted ? "default" : "outline"} asChild>
            <Link href={`/courses/${courseSlug}/lessons/${nextLesson.slug}`}>
              {nextLesson.title}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}

        {!nextLesson && isCompleted && (
          <Button asChild>
            <Link href={`/courses/${courseSlug}`}>
              Finish Course
              <ChevronRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
