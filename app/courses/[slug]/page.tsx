import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCourseBySlug } from "@/lib/course-service"
import CourseHeader from "@/components/courses/course-header"
import CourseContent from "@/components/courses/course-content"
import CourseInfo from "@/components/courses/course-info"
import CourseReviews from "@/components/courses/course-reviews"
import CourseMaterials from "@/components/courses/course-materials"
import EnrollmentSection from "@/components/courses/enrollment-section"
import { auth } from "@/lib/auth"

interface CoursePageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const course = await getCourseBySlug(params.slug)

  if (!course) {
    return {
      title: "Course Not Found",
    }
  }

  return {
    title: course.title,
    description: course.description,
  }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const session = await auth()
  const userId = session?.user?.id

  const course = await getCourseBySlug(params.slug, userId)

  if (!course) {
    notFound()
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <CourseHeader course={course} />

      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CourseContent course={course} />
            <CourseReviews course={course} userId={userId} />
          </div>

          <div className="lg:col-span-1 space-y-8">
            <EnrollmentSection course={course} enrollment={course.enrollment} userId={userId} />
            <CourseInfo course={course} />
            <CourseMaterials materials={course.materials} />
          </div>
        </div>
      </div>
    </div>
  )
}
