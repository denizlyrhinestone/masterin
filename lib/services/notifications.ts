import { executeQuery, toCamelCase, isPreviewEnvironment, getDatabaseStatus } from "@/lib/db"

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: Date
}

// Mock notifications for when the database is unavailable
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "mock-1",
    userId: "demo-user-123",
    type: "system",
    title: "Welcome to the platform",
    message: "Thank you for joining our educational platform!",
    isRead: false,
    createdAt: new Date(),
  },
  {
    id: "mock-2",
    userId: "demo-user-123",
    type: "course",
    title: "New course available",
    message: "Check out our new Machine Learning course",
    link: "/classes/machine-learning",
    isRead: true,
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
  },
]

// Helper function to check if we should use mock data
function shouldUseMockData(): boolean {
  const { available, attempted } = getDatabaseStatus()
  return isPreviewEnvironment() || (attempted && !available)
}

export async function getUserNotifications(userId: string, limit = 10, offset = 0): Promise<Notification[]> {
  // Use mock data in preview environments or when database is unavailable
  if (shouldUseMockData()) {
    console.log("Using mock notifications data")
    return userId === "demo-user-123" ? MOCK_NOTIFICATIONS : []
  }

  try {
    const notifications = await executeQuery<Notification>(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    )

    return notifications.map((notification) => toCamelCase<Notification>(notification))
  } catch (error) {
    console.error("Error getting user notifications:", error)
    // Return mock data for demo user, empty array for others
    return userId === "demo-user-123" ? MOCK_NOTIFICATIONS : []
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  // Use mock data in preview environments or when database is unavailable
  if (shouldUseMockData()) {
    console.log("Using mock unread count")
    return userId === "demo-user-123" ? 1 : 0
  }

  try {
    const result = await executeQuery<{ count: string }>(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE user_id = $1 AND is_read = false`,
      [userId],
    )

    return Number.parseInt(result[0]?.count || "0", 10)
  } catch (error) {
    console.error("Error getting unread notification count:", error)
    // Return mock count for demo user, 0 for others
    return userId === "demo-user-123" ? 1 : 0
  }
}

export async function addNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string,
): Promise<Notification | null> {
  // Skip in preview environments or when database is unavailable
  if (shouldUseMockData()) {
    console.log("Skipping add notification in preview/mock mode")
    return null
  }

  try {
    const result = await executeQuery<Notification>(
      `INSERT INTO notifications (user_id, type, title, message, link)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, type, title, message, link || null],
    )

    if (result.length === 0) {
      return null
    }

    return toCamelCase<Notification>(result[0])
  } catch (error) {
    console.error("Error adding notification:", error)
    return null
  }
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  // Skip in preview environments or when database is unavailable
  if (shouldUseMockData()) {
    console.log("Skipping mark as read in preview/mock mode")
    return true
  }

  try {
    const result = await executeQuery(
      `UPDATE notifications 
       SET is_read = true 
       WHERE id = $1
       RETURNING id`,
      [id],
    )

    return result.length > 0
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return false
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  // Skip in preview environments or when database is unavailable
  if (shouldUseMockData()) {
    console.log("Skipping mark all as read in preview/mock mode")
    return true
  }

  try {
    await executeQuery(
      `UPDATE notifications 
       SET is_read = true 
       WHERE user_id = $1 AND is_read = false`,
      [userId],
    )

    return true
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return false
  }
}
