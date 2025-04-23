import { Redis } from "@upstash/redis"

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

type RateLimitResult = {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export const rateLimit = {
  async check(req: Request, limit: number, duration: string): Promise<RateLimitResult> {
    try {
      // Get IP address from request
      const ip = req.headers.get("x-forwarded-for") || "anonymous"

      // Parse duration string (e.g., "1m", "10s", "1h")
      const durationInSeconds = parseDuration(duration)

      // Create a unique key for this IP and endpoint
      const url = new URL(req.url)
      const key = `ratelimit:${ip}:${url.pathname}`

      // Get current count from Redis
      const count = (await redis.get<number>(key)) || 0

      // Check if limit is exceeded
      if (count >= limit) {
        return {
          success: false,
          limit,
          remaining: 0,
          reset: durationInSeconds,
        }
      }

      // Increment count and set TTL
      await redis.incr(key)
      if (count === 0) {
        await redis.expire(key, durationInSeconds)
      }

      // Get TTL of the key
      const ttl = await redis.ttl(key)

      return {
        success: true,
        limit,
        remaining: Math.max(0, limit - (count + 1)),
        reset: ttl,
      }
    } catch (error) {
      console.error("Rate limit error:", error)
      // If rate limiting fails, allow the request through
      return {
        success: true,
        limit,
        remaining: 1,
        reset: 0,
      }
    }
  },
}

// Helper function to parse duration strings
function parseDuration(duration: string): number {
  const unit = duration.charAt(duration.length - 1)
  const value = Number.parseInt(duration.slice(0, -1))

  switch (unit) {
    case "s":
      return value
    case "m":
      return value * 60
    case "h":
      return value * 60 * 60
    case "d":
      return value * 60 * 60 * 24
    default:
      return 60 // Default to 1 minute
  }
}
