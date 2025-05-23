import { type NextRequest, NextResponse } from "next/server"
import { getCourseBySlug } from "@/lib/course-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const course = await getCourseBySlug(params.id)

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({ course })
  } catch (error) {
    console.error("Error fetching course:", error)
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 })
  }
}
