import { type NextRequest, NextResponse } from "next/server"
import { getUserNotifications, getUnreadNotificationCount } from "@/lib/services/notifications"
import { isPreviewEnvironment } from "@/lib/db"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    // Check if we're in a preview environment
    if (isPreviewEnvironment()) {
      console.log("Preview environment detected, returning mock data")

      // Return mock data for demo user
      if (userId === "demo-user-123") {
        return NextResponse.json({
          notifications: [
            {
              id: "mock-1",
              userId: "demo-user-123",
              type: "system",
              title: "Welcome to the platform",
              message: "Thank you for joining our educational platform!",
              isRead: false,
              createdAt: new Date().toISOString(),
            },
            {
              id: "mock-2",
              userId: "demo-user-123",
              type: "course",
              title: "New course available",
              message: "Check out our new Machine Learning course",
              link: "/classes/machine-learning",
              isRead: true,
              createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            },
          ],
          unreadCount: 1,
        })
      } else {
        return NextResponse.json({ notifications: [], unreadCount: 0 })
      }
    }

    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10)

    // Get notifications and unread count, handling any errors
    const [notifications, unreadCount] = await Promise.all([
      getUserNotifications(userId, limit, offset).catch((error) => {
        console.error("Error fetching notifications:", error)
        return []
      }),
      getUnreadNotificationCount(userId).catch((error) => {
        console.error("Error fetching unread count:", error)
        return 0
      }),
    ])

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error("Error in notifications API route:", error)
    // Return empty data instead of an error
    return NextResponse.json({ notifications: [], unreadCount: 0 })
  }
}
