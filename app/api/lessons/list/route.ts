import { NextResponse } from "next/server"

export async function GET() {
  const lessons = [
    {
      id: 1,
      courseId: 1,
      slug: "lesson-1",
      title: "Introduction",
      description: "Get started with the basics",
      duration: 15,
      order: 1,
      completed: true,
    },
    {
      id: 2,
      courseId: 1,
      slug: "lesson-2",
      title: "Getting Started",
      description: "Learn the fundamental concepts",
      duration: 25,
      order: 2,
      completed: false,
    },
  ]

  return NextResponse.json({ lessons })
}
