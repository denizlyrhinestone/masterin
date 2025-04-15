import qstashClient, { publishMessage } from "./qstash"
import redis from "./redis"

// Schedule a reminder for a user to continue a course
export async function scheduleCourseReminder(userId: string, courseId: string, courseTitle: string, delayHours = 24) {
  try {
    // The API endpoint that will handle the reminder
    const destination = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/reminders/course`

    // Schedule the reminder
    const result = await publishMessage(
      destination,
      {
        userId,
        courseId,
        courseTitle,
      },
      {
        delay: delayHours * 60 * 60, // Convert hours to seconds
        retry: 3, // Retry 3 times if the request fails
      },
    )

    if (result.success) {
      // Store the scheduled reminder in Redis for tracking
      await redis.hset(`user:${userId}:reminders`, {
        [`course:${courseId}`]: {
          messageId: result.messageId,
          scheduledAt: new Date().toISOString(),
          delayHours,
        },
      })
    }

    return result
  } catch (error) {
    console.error("Failed to schedule course reminder:", error)
    return { success: false, error }
  }
}

// Schedule weekly digest of course recommendations
export async function scheduleWeeklyDigest(userId: string) {
  try {
    // The API endpoint that will handle the weekly digest
    const destination = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/digest/weekly`

    // Schedule the weekly digest using a cron expression (every Monday at 9 AM)
    const result = await publishMessage(
      destination,
      { userId },
      {
        cron: "0 9 * * 1", // Every Monday at 9 AM
      },
    )

    if (result.success) {
      // Store the scheduled digest in Redis
      await redis.hset(`user:${userId}:scheduled_digests`, {
        weekly: {
          messageId: result.messageId,
          scheduledAt: new Date().toISOString(),
        },
      })
    }

    return result
  } catch (error) {
    console.error("Failed to schedule weekly digest:", error)
    return { success: false, error }
  }
}

// Cancel a scheduled reminder
export async function cancelScheduledReminder(userId: string, courseId: string) {
  try {
    // Get the reminder details
    const reminders = await redis.hgetall(`user:${userId}:reminders`)
    const reminder = reminders[`course:${courseId}`]

    if (reminder && reminder.messageId) {
      // Delete the scheduled message from QStash
      await qstashClient.deleteMessage(reminder.messageId)

      // Remove from Redis
      await redis.hdel(`user:${userId}:reminders`, `course:${courseId}`)

      return { success: true }
    }

    return { success: false, error: "Reminder not found" }
  } catch (error) {
    console.error("Failed to cancel scheduled reminder:", error)
    return { success: false, error }
  }
}
