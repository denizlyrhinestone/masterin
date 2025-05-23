import type { Metadata } from "next"
import { getCourseBySlug } from "@/lib/course-service"
import { notFound } from "next/navigation"
import CourseEditForm from "@/components/admin/course-edit-form"
import { auth } from "@/lib/auth"
import { isAdmin } from "@/lib/admin"

interface CourseEditPageProps {
  params: {
    slug: string
  }
}

export const metadata: Metadata = {
  title: "Edit Course - Admin",
  description: "Edit course details and content",
}

export default async function CourseEditPage({ params }: CourseEditPageProps) {
  const session = await auth()

  if (!session?.user || !isAdmin(session.user.email)) {
    notFound()
  }

  const course = await getCourseBySlug(params.slug)

  if (!course) {
    notFound()
  }

  return (
    <div className="container px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Course</h1>
        <CourseEditForm course={course} />
      </div>
    </div>
  )
}
