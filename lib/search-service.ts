import { supabaseClient } from "@/lib/supabase-client"

type SearchResult = {
  id: string
  title: string
  type: "course" | "category" | "resource" | "article"
  url: string
  description?: string
  imageUrl?: string
}

export async function searchContent(query: string, userId?: string): Promise<SearchResult[]> {
  if (!query || query.trim() === "") {
    return []
  }

  try {
    // Search courses
    const { data: courses, error: coursesError } = await supabaseClient
      .from("courses")
      .select("id, title, description, image_url")
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(5)

    if (coursesError) {
      console.error("Error searching courses:", coursesError)
    }

    // Search categories
    const { data: categories, error: categoriesError } = await supabaseClient
      .from("categories")
      .select("id, name, description, image_url")
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(3)

    if (categoriesError) {
      console.error("Error searching categories:", categoriesError)
    }

    // Search resources
    const { data: resources, error: resourcesError } = await supabaseClient
      .from("resources")
      .select("id, title, description, type")
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(3)

    if (resourcesError) {
      console.error("Error searching resources:", resourcesError)
    }

    // Format results
    const formattedCourses: SearchResult[] = (courses || []).map((course) => ({
      id: course.id,
      title: course.title,
      type: "course",
      url: `/courses/${course.id}`,
      description: course.description,
      imageUrl: course.image_url,
    }))

    const formattedCategories: SearchResult[] = (categories || []).map((category) => ({
      id: category.id,
      title: category.name,
      type: "category",
      url: `/categories/${category.id}`,
      description: category.description,
      imageUrl: category.image_url,
    }))

    const formattedResources: SearchResult[] = (resources || []).map((resource) => ({
      id: resource.id,
      title: resource.title,
      type: "resource",
      url: `/resources/${resource.id}`,
      description: resource.description,
    }))

    // Combine results
    const results = [...formattedCourses, ...formattedCategories, ...formattedResources]

    // Track search analytics
    await trackSearchQuery(query, userId, results.length)

    return results
  } catch (error) {
    console.error("Error in search service:", error)
    return []
  }
}

// Add this function to track search analytics
export async function trackSearchQuery(query: string, userId?: string, resultsCount = 0) {
  try {
    await supabaseClient.from("search_analytics").insert({
      query,
      user_id: userId || null,
      results_count: resultsCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error tracking search query:", error)
  }
}
