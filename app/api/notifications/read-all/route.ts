import { type NextRequest, NextResponse } from "next/server"
import { markAllNotificationsAsRead } from "@/lib/services/notifications"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const success = await markAllNotificationsAsRead(userId)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Failed to mark all notifications as read" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return NextResponse.json({ error: "Failed to mark all notifications as read" }, { status: 500 })
  }
}
