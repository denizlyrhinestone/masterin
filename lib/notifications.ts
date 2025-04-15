import redis from "./redis"

export type Notification = {
  id: string
  userId: string
  type: "course_update" | "achievement" | "reminder" | "announcement"
  title: string
  message: string
  link?: string
  createdAt: string
  read: boolean
}

// Add a notification for a user
export async function addNotification(
  userId: string,
  type: Notification["type"],
  title: string,
  message: string,
  link?: string,
): Promise<string> {
  try {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const notification: Notification = {
      id,
      userId,
      type,
      title,
      message,
      link,
      createdAt: new Date().toISOString(),
      read: false,
    }

    // Store notification in a hash
    await redis.hset(`notification:${id}`, notification)

    // Add to user's notifications list (sorted set with timestamp as score)
    await redis.zadd(`user:${userId}:notifications`, {
      score: Date.now(),
      member: id,
    })

    // Increment unread count
    await redis.incr(`user:${userId}:unread_notifications`)

    return id
  } catch (error) {
    console.error("Failed to add notification:", error)
    throw error
  }
}

// Get notifications for a user
export async function getUserNotifications(userId: string, limit = 10, offset = 0): Promise<Notification[]> {
  try {
    // Get notification IDs from the sorted set (newest first)
    const notificationIds = await redis.zrange(`user:${userId}:notifications`, offset, offset + limit - 1, {
      rev: true,
    })

    if (!notificationIds || notificationIds.length === 0) {
      return []
    }

    // Get notification details
    const notifications: Notification[] = []

    for (const id of notificationIds) {
      const notification = await redis.hgetall<Notification>(`notification:${id}`)
      if (notification) {
        notifications.push(notification)
      }
    }

    return notifications
  } catch (error) {
    console.error("Failed to get user notifications:", error)
    return []
  }
}

// Mark a notification as read
export async function markNotificationAsRead(userId: string, notificationId: string): Promise<boolean> {
  try {
    // Update the notification
    await redis.hset(`notification:${notificationId}`, { read: true })

    // Decrement unread count
    const unreadCount = (await redis.get<number>(`user:${userId}:unread_notifications`)) || 0
    if (unreadCount > 0) {
      await redis.decr(`user:${userId}:unread_notifications`)
    }

    return true
  } catch (error) {
    console.error("Failed to mark notification as read:", error)
    return false
  }
}

// Get unread notification count
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    return (await redis.get<number>(`user:${userId}:unread_notifications`)) || 0
  } catch (error) {
    console.error("Failed to get unread notification count:", error)
    return 0
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    // Get all notification IDs
    const notificationIds = await redis.zrange(`user:${userId}:notifications`, 0, -1)

    // Update each notification
    for (const id of notificationIds) {
      await redis.hset(`notification:${id}`, { read: true })
    }

    // Reset unread count
    await redis.set(`user:${userId}:unread_notifications`, 0)

    return true
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error)
    return false
  }
}
