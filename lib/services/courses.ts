import { executeQuery, toCamelCase } from "@/lib/db"

export interface Course {
  id: string
  title: string
  slug: string
  description?: string
  instructorId: string
  categoryId?: string
  level: "beginner" | "intermediate" | "advanced"
  price: number
  duration?: string
  imageUrl?: string
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CourseWithInstructor extends Course {
  instructorName: string
}

export async function getCourseById(id: string): Promise<Course | null> {
  try {
    const courses = await executeQuery<Course>("SELECT * FROM courses WHERE id = $1", [id])

    if (courses.length === 0) {
      return null
    }

    return toCamelCase<Course>(courses[0])
  } catch (error) {
    console.error("Error getting course by ID:", error)
    return null
  }
}

export async function getCourseBySlug(slug: string): Promise<CourseWithInstructor | null> {
  try {
    const courses = await executeQuery<CourseWithInstructor>(
      `SELECT c.*, u.name as instructor_name 
       FROM courses c
       JOIN users u ON c.instructor_id = u.id
       WHERE c.slug = $1`,
      [slug],
    )

    if (courses.length === 0) {
      return null
    }

    return toCamelCase<CourseWithInstructor>(courses[0])
  } catch (error) {
    console.error("Error getting course by slug:", error)
    return null
  }
}

export async function getPopularCourses(limit = 4): Promise<CourseWithInstructor[]> {
  try {
    const courses = await executeQuery<CourseWithInstructor>(
      `SELECT c.*, u.name as instructor_name, 
              (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrollment_count
       FROM courses c
       JOIN users u ON c.instructor_id = u.id
       WHERE c.is_published = true
       ORDER BY enrollment_count DESC
       LIMIT $1`,
      [limit],
    )

    return courses.map((course) => toCamelCase<CourseWithInstructor>(course))
  } catch (error) {
    console.error("Error getting popular courses:", error)
    return []
  }
}

export async function getCoursesByCategory(categoryId: string, limit?: number): Promise<CourseWithInstructor[]> {
  try {
    let query = `
      SELECT c.*, u.name as instructor_name
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      WHERE c.category_id = $1 AND c.is_published = true
      ORDER BY c.created_at DESC
    `

    if (limit) {
      query += ` LIMIT $2`
      return (await executeQuery<CourseWithInstructor>(query, [categoryId, limit])).map((course) =>
        toCamelCase<CourseWithInstructor>(course),
      )
    }

    return (await executeQuery<CourseWithInstructor>(query, [categoryId])).map((course) =>
      toCamelCase<CourseWithInstructor>(course),
    )
  } catch (error) {
    console.error("Error getting courses by category:", error)
    return []
  }
}

export async function incrementCourseViews(courseId: string): Promise<void> {
  try {
    // Record the view in user_activity table
    await executeQuery(
      `INSERT INTO user_activity (user_id, course_id, action)
       VALUES ($1, $2, $3)`,
      ["00000000-0000-0000-0000-000000000000", courseId, "view"], // Anonymous user ID for non-logged in users
    )
  } catch (error) {
    console.error("Error incrementing course views:", error)
  }
}

export async function getCourseViews(courseId: string): Promise<number> {
  try {
    const result = await executeQuery<{ count: string }>(
      `SELECT COUNT(*) as count FROM user_activity 
       WHERE course_id = $1 AND action = 'view'`,
      [courseId],
    )

    return Number.parseInt(result[0].count, 10)
  } catch (error) {
    console.error("Error getting course views:", error)
    return 0
  }
}
