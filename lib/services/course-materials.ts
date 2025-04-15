import { executeQuery, toCamelCase } from "@/lib/db"

export interface CourseMaterial {
  id: string
  courseId: string
  title: string
  description?: string
  type: string
  url: string
  size?: number
  createdAt: Date
  updatedAt: Date
}

export async function getCourseMaterials(courseId: string): Promise<CourseMaterial[]> {
  try {
    const materials = await executeQuery<CourseMaterial>(
      "SELECT * FROM course_materials WHERE course_id = $1 ORDER BY created_at DESC",
      [courseId],
    )

    return materials.map((material) => toCamelCase<CourseMaterial>(material))
  } catch (error) {
    console.error("Error getting course materials:", error)
    return []
  }
}

export async function addCourseMaterial(
  material: Omit<CourseMaterial, "id" | "createdAt" | "updatedAt">,
): Promise<CourseMaterial | null> {
  try {
    const result = await executeQuery<CourseMaterial>(
      `INSERT INTO course_materials (course_id, title, description, type, url, size)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        material.courseId,
        material.title,
        material.description || null,
        material.type,
        material.url,
        material.size || 0,
      ],
    )

    if (result.length === 0) {
      return null
    }

    return toCamelCase<CourseMaterial>(result[0])
  } catch (error) {
    console.error("Error adding course material:", error)
    return null
  }
}

export async function deleteCourseMaterial(id: string): Promise<boolean> {
  try {
    const result = await executeQuery("DELETE FROM course_materials WHERE id = $1 RETURNING id", [id])

    return result.length > 0
  } catch (error) {
    console.error("Error deleting course material:", error)
    return false
  }
}
