import { headers } from "next/headers"

// Simple in-memory rate limiter
// In production, you'd want to use a distributed solution like Redis
const ipRequests = new Map<string, { count: number; resetTime: number }>()

export const rateLimit = {
  check: async (
    req: Request,
    limit: number,
    window: string,
  ): Promise<{ success: boolean; limit: number; remaining: number }> => {
    // Get client IP
    const headersList = headers()
    const forwardedFor = headersList.get("x-forwarded-for")
    const ip = forwardedFor ? forwardedFor.split(",")[0] : "unknown"

    // Parse window (e.g., "1m", "5s", "1h")
    const unit = window.slice(-1)
    const value = Number.parseInt(window.slice(0, -1))

    let windowMs = 60 * 1000 // Default to 1 minute

    if (unit === "s") windowMs = value * 1000
    else if (unit === "m") windowMs = value * 60 * 1000
    else if (unit === "h") windowMs = value * 60 * 60 * 1000

    const now = Date.now()
    const ipData = ipRequests.get(ip)

    // If no previous requests or window expired, reset
    if (!ipData || now > ipData.resetTime) {
      ipRequests.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      })
      return { success: true, limit, remaining: limit - 1 }
    }

    // Increment request count
    ipData.count++

    // Check if over limit
    if (ipData.count > limit) {
      return { success: false, limit, remaining: 0 }
    }

    return { success: true, limit, remaining: limit - ipData.count }
  },
}
