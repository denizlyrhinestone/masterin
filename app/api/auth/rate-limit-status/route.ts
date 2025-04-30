import { type NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"
import { getClientIp } from "@/lib/rate-limit"

// Initialize Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL || "",
  token: process.env.KV_REST_API_TOKEN || "",
})

/**
 * API route to check rate limit status
 * This allows the client to check if they're rate limited without triggering an auth attempt
 */
export async function GET(request: NextRequest) {
  // Skip if Redis is not configured
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return NextResponse.json({ limited: false })
  }

  try {
    // Get client IP
    const ip = getClientIp(request)

    // Get path from query params
    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path")

    if (!path) {
      return NextResponse.json({ error: "Missing path parameter" }, { status: 400 })
    }

    // Create the rate limit key
    const key = `ratelimit:${path}:${ip}`

    // Get current count and TTL
    const [count, ttl] = await Promise.all([redis.get<number>(key), redis.ttl(key)])

    // Get rate limit config for this path
    const config = findRateLimitConfig(path)

    return NextResponse.json({
      limited: count !== null && count >= config.points,
      remaining: count !== null ? Math.max(0, config.points - count) : config.points,
      resetIn: ttl > 0 ? ttl : 0,
      limit: config.points,
      path,
    })
  } catch (error) {
    console.error("Rate limit status check error:", error)
    return NextResponse.json({ error: "Failed to check rate limit status" }, { status: 500 })
  }
}

// Helper function to find rate limit config (simplified version)
function findRateLimitConfig(path: string) {
  const RATE_LIMITS = {
    "/auth/sign-in": { points: 5, duration: 60 * 15 },
    "/auth/sign-up": { points: 3, duration: 60 * 60 },
    "/auth/forgot-password": { points: 3, duration: 60 * 60 },
    "/auth/reset-password": { points: 3, duration: 60 * 60 },
    default: { points: 10, duration: 60 * 5 },
  }

  // Check for exact match
  if (path in RATE_LIMITS) {
    return RATE_LIMITS[path as keyof typeof RATE_LIMITS]
  }

  // Use default rate limit
  return RATE_LIMITS.default
}
