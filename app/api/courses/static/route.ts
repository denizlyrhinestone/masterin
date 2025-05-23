import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Return static sample course data
    return NextResponse.json({
      course: {
        id: "sample-course",
        title: "Sample Course",
        description: "This is a sample course for demonstration purposes.",
        lessons: [
          {
            id: "lesson-1",
            title: "Introduction",
            description: "An introduction to the course.",
          },
          {
            id: "lesson-2",
            title: "Getting Started",
            description: "Learn the basics to get started.",
          },
        ],
      },
    })
  } catch (error) {
    console.error("Error fetching course:", error)
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 })
  }
}
