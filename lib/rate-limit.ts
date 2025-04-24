import { Redis } from "@upstash/redis"

// Initialize Redis client
let redis: Redis | null = null

try {
  redis = Redis.fromEnv()
} catch (error) {
  console.warn("Failed to initialize Redis client:", error)
  redis = null
}

export const rateLimit = {
  async check(req: Request, limit: number, window: string): Promise<{ success: boolean; remaining: number }> {
    try {
      if (!redis) {
        throw new Error("Redis client not initialized")
      }

      // Extract IP address from request
      const ip = req.headers.get("x-forwarded-for") || "anonymous"

      // Extract user ID from authorization header if available
      const authHeader = req.headers.get("authorization")
      let userId = "anonymous"

      if (authHeader && authHeader.startsWith("Bearer ")) {
        // In a real implementation, you would validate the token
        // and extract the user ID
        userId = authHeader.substring(7)
      }

      // Create a unique key for this rate limit
      const key = `ratelimit:${window}:${userId || ip}`

      // Get current count
      const current = (await redis.get<number>(key)) || 0

      // Check if limit is exceeded
      if (current >= limit) {
        return { success: false, remaining: 0 }
      }

      // Increment count
      await redis.incr(key)

      // Set expiration if this is the first request
      if (current === 0) {
        await redis.expire(key, Number.parseInt(window.replace(/[^0-9]/g, "")) * 60)
      }

      return { success: true, remaining: limit - current - 1 }
    } catch (error) {
      console.error("Rate limit error:", error)
      // Fail open - allow the request if there's an error with rate limiting
      return { success: true, remaining: 0 }
    }
  },
}
