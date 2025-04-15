import { type NextRequest, NextResponse } from "next/server"
import { getCourseCompletionPercentage, updateUserProgress } from "@/lib/services/user-progress"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("userId")
  const courseId = params.id

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    const progress = await getCourseCompletionPercentage(userId, courseId)

    return NextResponse.json({ progress })
  } catch (error) {
    console.error("Error fetching course progress:", error)
    return NextResponse.json({ error: "Failed to fetch course progress" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const courseId = params.id

  try {
    const { userId, lessonId, status, progressPercentage } = await request.json()

    if (!userId || !lessonId) {
      return NextResponse.json({ error: "User ID and lesson ID are required" }, { status: 400 })
    }

    // Update progress in database
    const result = await updateUserProgress(userId, lessonId, status || "in_progress", progressPercentage || 0)

    if (!result) {
      return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
    }

    // Get updated course progress
    const progress = await getCourseCompletionPercentage(userId, courseId)

    return NextResponse.json({ success: true, progress })
  } catch (error) {
    console.error("Error updating course progress:", error)
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
  }
}
