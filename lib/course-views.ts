import redis from "./redis"

export async function incrementCourseViews(courseId: string): Promise<number> {
  try {
    const views = await redis.incr(`course:${courseId}:views`)
    return views
  } catch (error) {
    console.error("Failed to increment course views:", error)
    return 0
  }
}

export async function getCourseViews(courseId: string): Promise<number> {
  try {
    const views = (await redis.get<number>(`course:${courseId}:views`)) || 0
    return views
  } catch (error) {
    console.error("Failed to get course views:", error)
    return 0
  }
}

export async function getPopularCourses(limit = 5): Promise<string[]> {
  try {
    // Check if Redis client is properly initialized
    if (!redis) {
      console.error("Redis client not initialized")
      return []
    }

    // Get all keys matching the pattern
    const keys = await redis.keys("course:*:views")

    // If no keys found, return empty array
    if (!keys || keys.length === 0) return []

    // Get views for each course
    const courseViews = await Promise.all(
      keys.map(async (key) => {
        try {
          const courseId = key.split(":")[1]
          const views = (await redis.get<number>(key)) || 0
          return { courseId, views }
        } catch (err) {
          console.error(`Error getting views for ${key}:`, err)
          return { courseId: key.split(":")[1], views: 0 }
        }
      }),
    )

    // Sort by views (descending) and take the top 'limit' courses
    return courseViews
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)
      .map((course) => course.courseId)
  } catch (error) {
    console.error("Failed to get popular courses:", error)
    // Return empty array instead of throwing an error
    return []
  }
}
