import { xai } from "@ai-sdk/xai"
import { streamText } from "ai"
import { rateLimit } from "@/lib/rate-limit"
import { NextResponse } from "next/server"
import { headers } from "next/headers"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  // Get user identifier (in a real app, this would be a user ID)
  // For demo purposes, we'll use IP address or a header
  const headersList = headers()
  const ip = headersList.get("x-forwarded-for") || "anonymous"
  const userId = headersList.get("x-user-id") || ip

  // Apply rate limiting: 20 requests per minute
  const rateLimitResult = await rateLimit(userId, 20, 60 * 1000)

  // If rate limit exceeded, return 429 Too Many Requests
  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        resetAt: rateLimitResult.resetAt.toISOString(),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": "20",
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.resetAt.toISOString(),
        },
      },
    )
  }

  try {
    // Extract the messages from the body of the request
    const { messages } = await req.json()

    // Add system message for educational context
    const systemMessage = {
      role: "system",
      content: `You are an AI educational assistant specialized in helping students learn various subjects.
      - Provide clear, concise explanations
      - Break down complex topics into simpler parts
      - Use examples to illustrate concepts
      - Encourage critical thinking
      - Provide practice problems when appropriate
      - Be encouraging and supportive
      - If you don't know something, admit it rather than making up information`,
    }

    // Prepend the system message
    const augmentedMessages = [systemMessage, ...messages]

    // Call the language model
    const result = streamText({
      model: xai("grok-3-mini-beta"),
      messages: augmentedMessages,
    })

    // Add rate limit headers to the response
    const response = result.toDataStreamResponse()
    response.headers.set("X-RateLimit-Limit", "20")
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString())
    response.headers.set("X-RateLimit-Reset", rateLimitResult.resetAt.toISOString())

    return response
  } catch (error) {
    console.error("AI tutor error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
