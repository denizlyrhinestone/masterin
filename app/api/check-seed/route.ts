import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    // Get counts from main tables
    const [usersCount, categoriesCount, coursesCount] = await Promise.all([
      executeQuery<{ count: string }>("SELECT COUNT(*) as count FROM users"),
      executeQuery<{ count: string }>("SELECT COUNT(*) as count FROM categories"),
      executeQuery<{ count: string }>("SELECT COUNT(*) as count FROM courses"),
    ])

    // Get sample data
    const [sampleUser, sampleCategory, sampleCourse] = await Promise.all([
      executeQuery("SELECT id, name, email, role FROM users LIMIT 1"),
      executeQuery("SELECT id, name, color FROM categories LIMIT 1"),
      executeQuery("SELECT id, title, slug, price FROM courses LIMIT 1"),
    ])

    return NextResponse.json({
      counts: {
        users: Number(usersCount[0].count),
        categories: Number(categoriesCount[0].count),
        courses: Number(coursesCount[0].count),
      },
      samples: {
        user: sampleUser[0] || null,
        category: sampleCategory[0] || null,
        course: sampleCourse[0] || null,
      },
    })
  } catch (error) {
    console.error("Error checking seed status:", error)
    return NextResponse.json({ error: "Failed to check seed status" }, { status: 500 })
  }
}
