import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { updateLessonProgress } from "@/lib/course-service"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { lessonId, isCompleted, timeSpentSeconds, notes } = await request.json()

    if (!lessonId) {
      return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 })
    }

    const result = await updateLessonProgress(session.user.id, lessonId, isCompleted, timeSpentSeconds || 0, notes)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating lesson progress:", error)
    return NextResponse.json({ error: "Failed to update lesson progress" }, { status: 500 })
  }
}
