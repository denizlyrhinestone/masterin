import { executeQuery, toCamelCase } from "@/lib/db"

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

export async function getUserNotifications(userId: string, limit = 10, offset = 0): Promise<Notification[]> {
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
    return []
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const result = await executeQuery<{ count: string }>(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE user_id = $1 AND is_read = false`,
      [userId],
    )

    return Number.parseInt(result[0].count, 10)
  } catch (error) {
    console.error("Error getting unread notification count:", error)
    return 0
  }
}

export async function addNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string,
): Promise<Notification | null> {
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
