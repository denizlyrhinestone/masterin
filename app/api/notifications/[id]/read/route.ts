import { type NextRequest, NextResponse } from "next/server"
import { markNotificationAsRead } from "@/lib/services/notifications"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const notificationId = params.id

  try {
    const success = await markNotificationAsRead(notificationId)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}
