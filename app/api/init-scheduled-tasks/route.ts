import { type NextRequest, NextResponse } from "next/server"
import { scheduleDailyAnalytics } from "@/lib/course-analytics"
import { scheduleWeeklyDigest } from "@/lib/course-reminders"

export async function POST(request: NextRequest) {
  try {
    // Initialize all scheduled tasks

    // 1. Schedule daily analytics processing
    const analyticsResult = await scheduleDailyAnalytics()

    // 2. Schedule weekly digest for demo user
    const userId = "demo-user-123"
    const digestResult = await scheduleWeeklyDigest(userId)

    return NextResponse.json({
      success: true,
      tasks: {
        dailyAnalytics: analyticsResult,
        weeklyDigest: digestResult,
      },
    })
  } catch (error) {
    console.error("Error initializing scheduled tasks:", error)
    return NextResponse.json({ error: "Failed to initialize scheduled tasks" }, { status: 500 })
  }
}
