import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getLessonBySlug } from "@/lib/course-service"
import LessonContent from "@/components/lessons/lesson-content"
import LessonNavigation from "@/components/lessons/lesson-navigation"
import LessonProgress from "@/components/lessons/lesson-progress"
import LessonExercises from "@/components/lessons/lesson-exercises"
import { auth } from "@/lib/auth"

interface LessonPageProps {
  params: {
    slug: string
    lessonSlug: string
  }
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const result = await getLessonBySlug(params.slug, params.lessonSlug)

  if (!result || !result.lesson) {
    return {
      title: "Lesson Not Found",
    }
  }

  return {
    title: `${result.lesson.title} - ${result.course.title}`,
    description: result.lesson.description,
  }
}

export default async function LessonPage({ params }: LessonPageProps) {
  const session = await auth()
  const userId = session?.user?.id

  const result = await getLessonBySlug(params.slug, params.lessonSlug, userId)

  if (!result || !result.lesson) {
    notFound()
  }

  const { course, lesson, progress, previousLesson, nextLesson } = result

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
              <h1 className="text-2xl font-bold mb-2">{lesson.title}</h1>
              <p className="text-gray-500 dark:text-gray-400 mb-6">{lesson.description}</p>

              <LessonContent content={lesson.content} />

              {lesson.exercises && lesson.exercises.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-xl font-bold mb-4">Exercises</h2>
                  <LessonExercises exercises={lesson.exercises} />
                </div>
              )}

              <LessonNavigation courseSlug={course.slug} previousLesson={previousLesson} nextLesson={nextLesson} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <LessonProgress lesson={lesson} progress={progress} userId={userId} courseSlug={course.slug} />
          </div>
        </div>
      </div>
    </div>
  )
}
