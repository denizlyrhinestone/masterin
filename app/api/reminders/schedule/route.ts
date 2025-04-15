import { type NextRequest, NextResponse } from "next/server"
import { scheduleCourseReminder } from "@/lib/services/course-reminders"
import { scheduleWeeklyDigest } from "@/lib/course-reminders" // We'll keep this in Redis for now

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, courseId, courseTitle, type, delayHours } = body

    if (type === "course") {
      if (!userId || !courseId || !courseTitle) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
      }

      const result = await scheduleCourseReminder(userId, courseId, courseTitle, delayHours || 24)

      if (result.success) {
        return NextResponse.json({
          success: true,
          messageId: result.messageId,
          reminderId: result.reminderId,
        })
      } else {
        return NextResponse.json({ error: "Failed to schedule reminder" }, { status: 500 })
      }
    } else if (type === "weekly-digest") {
      if (!userId) {
        return NextResponse.json({ error: "Missing user ID" }, { status: 400 })
      }

      // We'll keep using the Redis implementation for weekly digest for now
      const result = await scheduleWeeklyDigest(userId)

      if (result.success) {
        return NextResponse.json({ success: true, messageId: result.messageId })
      } else {
        return NextResponse.json({ error: "Failed to schedule weekly digest" }, { status: 500 })
      }
    } else {
      return NextResponse.json({ error: "Invalid reminder type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error scheduling reminder:", error)
    return NextResponse.json({ error: "Failed to schedule reminder" }, { status: 500 })
  }
}
