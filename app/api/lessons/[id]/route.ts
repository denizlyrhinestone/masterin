import { type NextRequest, NextResponse } from "next/server"
import { getLessonById } from "@/lib/course-service"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const lesson = await getLessonById(Number.parseInt(params.id))

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 })
    }

    return NextResponse.json({ lesson })
  } catch (error) {
    console.error("Error fetching lesson:", error)
    return NextResponse.json({ error: "Failed to fetch lesson" }, { status: 500 })
  }
}
