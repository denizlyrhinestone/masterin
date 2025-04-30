import { Redis } from "@upstash/redis"
import { type NextRequest, NextResponse } from "next/server"

// Initialize Redis client using environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
})

// Rate limit configuration for different endpoints
const RATE_LIMITS = {
  // Authentication endpoints
  "/auth/sign-in": { points: 5, duration: 60 * 15 }, // 5 attempts per 15 minutes
  "/auth/sign-up": { points: 3, duration: 60 * 60 }, // 3 attempts per hour
  "/auth/forgot-password": { points: 3, duration: 60 * 60 }, // 3 attempts per hour
  "/auth/reset-password": { points: 3, duration: 60 * 60 }, // 3 attempts per hour

  // Default rate limit for other endpoints
  default: { points: 10, duration: 60 * 5 }, // 10 attempts per 5 minutes
}

// Interface for rate limit configuration
interface RateLimitConfig {
  points: number // Number of requests allowed
  duration: number // Time window in seconds
}

/**
 * Rate limiting middleware function
 *
 * @param request - The incoming request
 * @param path - The path to apply rate limiting to (defaults to request path)
 * @returns Response if rate limited, null if not limited
 */
export async function rateLimit(request: NextRequest, path?: string): Promise<NextResponse | null> {
  // Skip rate limiting if Redis is not configured
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    console.warn("Rate limiting is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.")
    return null
  }

  try {
    // Get client IP
    const ip = getClientIp(request)

    // Get the path to rate limit
    const limitPath = path || request.nextUrl.pathname

    // Find the most specific rate limit configuration
    const config = findRateLimitConfig(limitPath)

    // Create a unique key for this IP and endpoint
    const key = `ratelimit:${limitPath}:${ip}`

    // Check if the request should be rate limited
    const limited = await isRateLimited(key, config)

    if (limited) {
      // Return rate limit response
      return createRateLimitResponse(config.duration)
    }

    // Not rate limited
    return null
  } catch (error) {
    // Log the error but don't block the request (fail open)
    console.error("Rate limiting error:", error)
    return null
  }
}

/**
 * Get the client IP address from the request
 */
export function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1"
}

/**
 * Find the most specific rate limit configuration for a path
 */
function findRateLimitConfig(path: string): RateLimitConfig {
  // Check for exact match
  if (path in RATE_LIMITS) {
    return RATE_LIMITS[path as keyof typeof RATE_LIMITS]
  }

  // Check for parent paths
  const pathParts = path.split("/").filter(Boolean)
  while (pathParts.length > 0) {
    pathParts.pop()
    const parentPath = `/${pathParts.join("/")}`
    if (parentPath in RATE_LIMITS) {
      return RATE_LIMITS[parentPath as keyof typeof RATE_LIMITS]
    }
  }

  // Use default rate limit
  return RATE_LIMITS.default
}

/**
 * Check if a request should be rate limited
 */
async function isRateLimited(key: string, config: RateLimitConfig): Promise<boolean> {
  // Get current count
  const current = (await redis.get<number>(key)) || 0

  // Check if limit exceeded
  if (current >= config.points) {
    return true
  }

  // Increment count
  await redis.incr(key)

  // Set expiration if this is the first request
  if (current === 0) {
    await redis.expire(key, config.duration)
  }

  return false
}

/**
 * Create a rate limit response
 */
function createRateLimitResponse(retryAfter: number): NextResponse {
  return new NextResponse(
    JSON.stringify({
      error: "too_many_requests",
      message: "Too many requests. Please try again later.",
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    },
  )
}
