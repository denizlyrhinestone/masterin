import redis from "./redis"
import { publishMessage } from "./qstash"

// Record user activity for analytics
export async function recordUserActivity(userId: string, courseId: string, action: string) {
  try {
    const timestamp = Date.now()

    // Store activity in a time series
    await redis.zadd(`analytics:activity`, {
      score: timestamp,
      member: JSON.stringify({
        userId,
        courseId,
        action,
        timestamp,
      }),
    })

    return true
  } catch (error) {
    console.error("Failed to record user activity:", error)
    return false
  }
}

// Schedule daily analytics processing
export async function scheduleDailyAnalytics() {
  try {
    const destination = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/analytics/process-daily`

    // Schedule to run daily at midnight
    const result = await publishMessage(
      destination,
      { timestamp: Date.now() },
      { cron: "0 0 * * *" }, // Every day at midnight
    )

    return result
  } catch (error) {
    console.error("Failed to schedule daily analytics:", error)
    return { success: false, error }
  }
}

// Process daily analytics (to be called by QStash)
export async function processDailyAnalytics() {
  try {
    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000

    // Get all activity from the last 24 hours
    const activities = await redis.zrangebyscore(`analytics:activity`, oneDayAgo, now)

    if (!activities || activities.length === 0) {
      return { processed: 0 }
    }

    // Process activities
    const courseViews = new Map<string, number>()
    const userEngagement = new Map<string, Set<string>>()

    for (const activity of activities) {
      const data = JSON.parse(activity)

      // Count course views
      if (data.action === "view") {
        courseViews.set(data.courseId, (courseViews.get(data.courseId) || 0) + 1)
      }

      // Track user engagement with courses
      if (!userEngagement.has(data.userId)) {
        userEngagement.set(data.userId, new Set())
      }
      userEngagement.get(data.userId)?.add(data.courseId)
    }

    // Update daily course views
    for (const [courseId, views] of courseViews.entries()) {
      await redis.zadd(`analytics:daily:course_views`, {
        score: now,
        member: JSON.stringify({ courseId, views, date: new Date(now).toISOString().split("T")[0] }),
      })
    }

    // Update user engagement metrics
    for (const [userId, courses] of userEngagement.entries()) {
      await redis.zadd(`analytics:daily:user_engagement`, {
        score: now,
        member: JSON.stringify({
          userId,
          courseCount: courses.size,
          date: new Date(now).toISOString().split("T")[0],
        }),
      })
    }

    // Clean up old data (keep only 90 days)
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000
    await redis.zremrangebyscore(`analytics:activity`, 0, ninetyDaysAgo)

    return {
      processed: activities.length,
      courseViews: Object.fromEntries(courseViews),
      userEngagement: Array.from(userEngagement.entries()).map(([userId, courses]) => ({
        userId,
        courseCount: courses.size,
      })),
    }
  } catch (error) {
    console.error("Failed to process daily analytics:", error)
    throw error
  }
}
