import { executeQuery, toCamelCase } from "@/lib/db"

export interface Category {
  id: string
  name: string
  description?: string
  imageUrl?: string
  color?: string
  createdAt: Date
  updatedAt: Date
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const categories = await executeQuery<Category>("SELECT * FROM categories ORDER BY name ASC")

    return categories.map((category) => toCamelCase<Category>(category))
  } catch (error) {
    console.error("Error getting all categories:", error)
    return []
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const categories = await executeQuery<Category>("SELECT * FROM categories WHERE id = $1", [id])

    if (categories.length === 0) {
      return null
    }

    return toCamelCase<Category>(categories[0])
  } catch (error) {
    console.error("Error getting category by ID:", error)
    return null
  }
}
