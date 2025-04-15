import redis from "./redis"

// Record that a user viewed a course
export async function recordCourseView(userId: string, courseId: string) {
  try {
    // Add to user's recently viewed courses (sorted set with timestamp as score)
    await redis.zadd(`user:${userId}:viewed`, { score: Date.now(), member: courseId })

    // Limit to last 20 viewed courses
    await redis.zremrangebyrank(`user:${userId}:viewed`, 0, -21)

    // Increment view count in the course:courseId:viewers sorted set
    await redis.zincrby(`course:${courseId}:viewers`, 1, userId)

    return true
  } catch (error) {
    console.error("Failed to record course view:", error)
    return false
  }
}

// Get similar users based on viewing patterns
async function getSimilarUsers(userId: string, limit = 5) {
  try {
    // Get courses viewed by this user
    const userCourses = await redis.zrange(`user:${userId}:viewed`, 0, -1)

    if (!userCourses || userCourses.length === 0) {
      return []
    }

    // Find users who viewed the same courses
    const similarUsers = new Map<string, number>()

    for (const courseId of userCourses) {
      // Get users who viewed this course
      const viewers = await redis.zrange(`course:${courseId}:viewers`, 0, -1)

      for (const viewer of viewers) {
        // Skip the current user
        if (viewer === userId) continue

        // Increment similarity score
        similarUsers.set(viewer, (similarUsers.get(viewer) || 0) + 1)
      }
    }

    // Sort by similarity score and take top 'limit'
    return Array.from(similarUsers.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id)
  } catch (error) {
    console.error("Failed to get similar users:", error)
    return []
  }
}

// Get course recommendations for a user
export async function getRecommendedCourses(userId: string, limit = 5) {
  try {
    // Get courses already viewed by this user
    const viewedCourses = new Set(await redis.zrange(`user:${userId}:viewed`, 0, -1))

    // Get similar users
    const similarUsers = await getSimilarUsers(userId)

    if (similarUsers.length === 0) {
      // If no similar users, return popular courses
      const popularCourses = await redis.zrange(`popular:courses`, 0, limit - 1, { rev: true })
      return popularCourses
    }

    // Collect courses viewed by similar users
    const recommendedCourses = new Map<string, number>()

    for (const similarUser of similarUsers) {
      const courses = await redis.zrange(`user:${similarUser}:viewed`, 0, -1)

      for (const course of courses) {
        // Skip courses already viewed by the current user
        if (viewedCourses.has(course)) continue

        // Increment recommendation score
        recommendedCourses.set(course, (recommendedCourses.get(course) || 0) + 1)
      }
    }

    // Sort by recommendation score and take top 'limit'
    const recommendations = Array.from(recommendedCourses.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id)

    // If not enough recommendations, fill with popular courses
    if (recommendations.length < limit) {
      const popularCourses = await redis.zrange(`popular:courses`, 0, limit - 1, { rev: true })

      for (const course of popularCourses) {
        if (!viewedCourses.has(course) && !recommendations.includes(course)) {
          recommendations.push(course)
          if (recommendations.length >= limit) break
        }
      }
    }

    return recommendations
  } catch (error) {
    console.error("Failed to get recommended courses:", error)
    return []
  }
}

// Update popular courses list (to be run periodically)
export async function updatePopularCourses() {
  try {
    // Get all course view counts
    const keys = await redis.keys("course:*:views")

    for (const key of keys) {
      const courseId = key.split(":")[1]
      const views = (await redis.get<number>(key)) || 0

      // Update popular courses sorted set
      await redis.zadd("popular:courses", { score: views, member: courseId })
    }

    return true
  } catch (error) {
    console.error("Failed to update popular courses:", error)
    return false
  }
}
