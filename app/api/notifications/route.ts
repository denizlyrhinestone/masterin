import { type NextRequest, NextResponse } from "next/server"
import { getUserNotifications, getUnreadNotificationCount } from "@/lib/services/notifications"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10)

    const [notifications, unreadCount] = await Promise.all([
      getUserNotifications(userId, limit, offset),
      getUnreadNotificationCount(userId),
    ])

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
