import { kv } from "@vercel/kv"
import { logger } from "./logger"
import { RateLimitError } from "./errors"

// Rate limit configuration
interface RateLimitConfig {
  limit: number
  window: number // in seconds
}

// Default rate limits
const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  "ai-tutor": { limit: 20, window: 60 }, // 20 requests per minute
  "enhanced-tutor": { limit: 10, window: 60 }, // 10 requests per minute
  default: { limit: 60, window: 60 }, // 60 requests per minute
}

// Check if rate limiting is available
const isRateLimitingAvailable = !!process.env.KV_REST_API_TOKEN || !!process.env.UPSTASH_REDIS_REST_TOKEN

// Get rate limit key for a request
function getRateLimitKey(req: Request, type = "default"): string {
  // Get IP address from request
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"

  // Get user ID from authorization header if available
  let userId = "anonymous"
  const authHeader = req.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    // Extract user ID from JWT token if possible
    try {
      const token = authHeader.substring(7)
      const payload = JSON.parse(atob(token.split(".")[1]))
      if (payload.sub) {
        userId = payload.sub
      }
    } catch (error) {
      // Ignore token parsing errors
    }
  }

  // Create a rate limit key that includes the type, IP, and user ID
  return `ratelimit:${type}:${ip}:${userId}`
}

// Check rate limit for a request
export async function rateLimit(
  req: Request,
  type = "default",
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // Skip rate limiting if not available
  if (!isRateLimitingAvailable) {
    logger.debug("Rate limiting not available, skipping check")
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    }
  }

  try {
    // Get rate limit config
    const config = DEFAULT_RATE_LIMITS[type] || DEFAULT_RATE_LIMITS.default
    const { limit, window } = config

    // Get current timestamp
    const now = Math.floor(Date.now() / 1000)

    // Calculate window expiration
    const windowExpiration = now + window

    // Get rate limit key
    const key = getRateLimitKey(req, type)

    // Increment counter in KV store
    let counter
    try {
      // Use KV store if available
      counter = await kv.incr(key)

      // Set expiration if this is the first request in the window
      if (counter === 1) {
        await kv.expire(key, window)
      }
    } catch (error) {
      // If KV store is not available, allow the request
      logger.warn("Rate limiting KV store error, allowing request", { error })
      return {
        success: true,
        limit,
        remaining: limit,
        reset: windowExpiration,
      }
    }

    // Get TTL for the key
    const ttl = await kv.ttl(key)
    const reset = ttl > 0 ? now + ttl : windowExpiration

    // Calculate remaining requests
    const remaining = Math.max(0, limit - counter)

    // Check if rate limit exceeded
    const success = counter <= limit

    // Log rate limit check
    logger.debug("Rate limit check", {
      type,
      key: key.substring(0, 20) + "...",
      counter,
      limit,
      remaining,
      reset,
      success,
    })

    if (!success) {
      throw new RateLimitError("Rate limit exceeded")
    }

    return { success, limit, remaining, reset }
  } catch (error) {
    // If rate limiting fails, allow the request
    logger.error("Rate limiting error, allowing request", { error })
    if (error instanceof RateLimitError) {
      throw error
    }
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
    }
  }
}
