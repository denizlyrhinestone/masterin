import redis from "./redis"

export async function rateLimit(
  identifier: string, // User ID or IP address
  maxRequests = 20, // Maximum requests allowed
  windowMs = 60000, // Time window in milliseconds (1 minute)
): Promise<{ success: boolean; remaining: number; resetAt: Date }> {
  const key = `ratelimit:${identifier}`
  const now = Date.now()
  const windowStart = now - windowMs

  try {
    // Add the current timestamp to the sorted set
    await redis.zadd(key, { score: now, member: now.toString() })

    // Remove timestamps outside the current window
    await redis.zremrangebyscore(key, 0, windowStart)

    // Count the number of requests in the current window
    const requestCount = await redis.zcard(key)

    // Set expiry on the key to clean up automatically
    await redis.expire(key, Math.ceil(windowMs / 1000))

    // Calculate remaining requests and reset time
    const remaining = Math.max(0, maxRequests - requestCount)
    const resetAt = new Date(now + windowMs)

    return {
      success: requestCount <= maxRequests,
      remaining,
      resetAt,
    }
  } catch (error) {
    console.error("Rate limiting error:", error)
    // In case of error, allow the request but with a warning
    return {
      success: true,
      remaining: 0,
      resetAt: new Date(now + windowMs),
    }
  }
}
