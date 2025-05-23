import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { unenrollFromCourse } from "@/lib/course-service"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required" }, { status: 400 })
    }

    const result = await unenrollFromCourse(session.user.id, courseId)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error unenrolling from course:", error)
    return NextResponse.json({ error: "Failed to unenroll from course" }, { status: 500 })
  }
}
