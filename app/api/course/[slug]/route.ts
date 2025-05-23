import { type NextRequest, NextResponse } from "next/server"
import { getCourseBySlug } from "@/lib/course-service"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const course = await getCourseBySlug(params.slug)

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({ course })
  } catch (error) {
    console.error("Error fetching course:", error)
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 })
  }
}
