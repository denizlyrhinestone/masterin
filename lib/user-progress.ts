import redis from "./redis"

// Track user progress in a course
export async function trackUserProgress(userId: string, courseId: string, lessonId: string, completed: boolean) {
  try {
    // Store in a hash: user:{userId}:progress:{courseId}
    await redis.hset(`user:${userId}:progress:${courseId}`, {
      [lessonId]: completed ? "completed" : "in-progress",
      lastUpdated: new Date().toISOString(),
    })

    // If completed, increment the user's completed lesson count for this course
    if (completed) {
      await redis.hincrby(`user:${userId}:stats`, `${courseId}:completed`, 1)
    }

    return true
  } catch (error) {
    console.error("Failed to track user progress:", error)
    return false
  }
}

// Get user progress for a specific course
export async function getUserCourseProgress(userId: string, courseId: string) {
  try {
    const progress = await redis.hgetall(`user:${userId}:progress:${courseId}`)
    return progress || {}
  } catch (error) {
    console.error("Failed to get user course progress:", error)
    return {}
  }
}

// Get user's overall progress stats
export async function getUserProgressStats(userId: string) {
  try {
    const stats = await redis.hgetall(`user:${userId}:stats`)
    return stats || {}
  } catch (error) {
    console.error("Failed to get user progress stats:", error)
    return {}
  }
}

// Get completion percentage for a course
export async function getCourseCompletionPercentage(userId: string, courseId: string, totalLessons: number) {
  try {
    const progress = await getUserCourseProgress(userId, courseId)

    // Count completed lessons
    let completedLessons = 0
    for (const [key, value] of Object.entries(progress)) {
      if (key !== "lastUpdated" && value === "completed") {
        completedLessons++
      }
    }

    return Math.round((completedLessons / totalLessons) * 100)
  } catch (error) {
    console.error("Failed to calculate completion percentage:", error)
    return 0
  }
}
