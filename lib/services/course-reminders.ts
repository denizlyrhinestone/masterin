import { executeQuery, toCamelCase } from "@/lib/db"
import { publishMessage } from "@/lib/qstash"

export interface CourseReminder {
  id: string
  userId: string
  courseId: string
  messageId?: string
  scheduledAt: Date
  sentAt?: Date
  createdAt: Date
}

export async function scheduleCourseReminder(
  userId: string,
  courseId: string,
  courseTitle: string,
  delayHours = 24,
): Promise<{ success: boolean; reminderId?: string; messageId?: string }> {
  try {
    // The API endpoint that will handle the reminder
    const destination = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/reminders/course`

    // Schedule the reminder with QStash
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

    if (!result.success) {
      return { success: false }
    }

    // Calculate the scheduled time
    const scheduledAt = new Date()
    scheduledAt.setHours(scheduledAt.getHours() + delayHours)

    // Store the reminder in the database
    const dbResult = await executeQuery<CourseReminder>(
      `INSERT INTO course_reminders (user_id, course_id, message_id, scheduled_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [userId, courseId, result.messageId, scheduledAt],
    )

    if (dbResult.length === 0) {
      return { success: false }
    }

    return {
      success: true,
      reminderId: dbResult[0].id,
      messageId: result.messageId,
    }
  } catch (error) {
    console.error("Error scheduling course reminder:", error)
    return { success: false }
  }
}

export async function getCourseReminders(userId: string, courseId?: string): Promise<CourseReminder[]> {
  try {
    let query = `SELECT * FROM course_reminders WHERE user_id = $1`
    const params = [userId]

    if (courseId) {
      query += ` AND course_id = $2`
      params.push(courseId)
    }

    query += ` ORDER BY scheduled_at DESC`

    const reminders = await executeQuery<CourseReminder>(query, params)

    return reminders.map((reminder) => toCamelCase<CourseReminder>(reminder))
  } catch (error) {
    console.error("Error getting course reminders:", error)
    return []
  }
}
