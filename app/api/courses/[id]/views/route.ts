import { NextResponse } from "next/server"
import { incrementCourseViews, getCourseViews } from "@/lib/services/courses"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const courseId = params.id
    await incrementCourseViews(courseId)
    const views = await getCourseViews(courseId)

    return NextResponse.json({ views })
  } catch (error) {
    console.error("Error incrementing course views:", error)
    return NextResponse.json({ error: "Failed to increment course views" }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const courseId = params.id
    const views = await getCourseViews(courseId)

    return NextResponse.json({ views })
  } catch (error) {
    console.error("Error getting course views:", error)
    return NextResponse.json({ error: "Failed to get course views" }, { status: 500 })
  }
}
