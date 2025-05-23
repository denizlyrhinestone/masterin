import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { submitCourseReview } from "@/lib/course-service"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId, rating, reviewText } = await request.json()

    if (!courseId || !rating) {
      return NextResponse.json({ error: "Course ID and rating are required" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const result = await submitCourseReview(session.user.id, courseId, rating, reviewText)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error submitting course review:", error)
    return NextResponse.json({ error: "Failed to submit course review" }, { status: 500 })
  }
}
