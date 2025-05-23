import type { Metadata } from "next"
import { getCourseBySlug } from "@/lib/course-service"
import { notFound } from "next/navigation"
import CourseEditForm from "@/components/admin/course-edit-form"
import { auth } from "@/lib/auth"
import { isAdmin } from "@/lib/admin"
import { supabase } from "@/lib/supabase" // Declare the supabase variable

interface CourseEditPageProps {
  params: {
    courseId: string
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

  // Convert courseId to number if it's numeric, otherwise treat as slug
  const courseIdNum = Number.parseInt(params.courseId)
  const course = isNaN(courseIdNum) ? await getCourseBySlug(params.courseId) : await getCourseById(courseIdNum)

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

// Helper function to get course by ID
async function getCourseById(id: number) {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select(`
        *,
        subject:subjects(id, name),
        gradeLevel:grade_levels(id, name)
      `)
      .eq("id", id)
      .single()

    if (error) throw error // Fix the typo in throw error
    return data
  } catch (error) {
    console.error("Error fetching course by ID:", error)
    return null
  }
}
