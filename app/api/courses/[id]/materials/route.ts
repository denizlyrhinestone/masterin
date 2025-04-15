import { NextResponse } from "next/server"
import { getCourseMaterials, addCourseMaterial } from "@/lib/services/course-materials"

// Get all materials for a course
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const courseId = params.id
    const materials = await getCourseMaterials(courseId)

    return NextResponse.json({ materials })
  } catch (error) {
    console.error("Error fetching course materials:", error)
    return NextResponse.json({ error: "Failed to fetch course materials" }, { status: 500 })
  }
}

// Add a new material to a course
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const courseId = params.id
    const { title, url, type, description, size } = await request.json()

    if (!title || !url || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const material = await addCourseMaterial({
      courseId,
      title,
      url,
      type,
      description,
      size,
    })

    if (!material) {
      return NextResponse.json({ error: "Failed to add course material" }, { status: 500 })
    }

    return NextResponse.json(material)
  } catch (error) {
    console.error("Error adding course material:", error)
    return NextResponse.json({ error: "Failed to add course material" }, { status: 500 })
  }
}
