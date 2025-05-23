import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Return static sample lesson data
    return NextResponse.json({
      lesson: {
        id: "sample-lesson",
        title: "Sample Lesson",
        description: "This is a sample lesson for demonstration purposes.",
        content: "<p>This is the content of the sample lesson.</p>",
        exercises: [
          {
            id: "exercise-1",
            title: "Practice Exercise",
            description: "Try this practice exercise to test your knowledge.",
          },
        ],
      },
    })
  } catch (error) {
    console.error("Error fetching lesson:", error)
    return NextResponse.json({ error: "Failed to fetch lesson" }, { status: 500 })
  }
}
