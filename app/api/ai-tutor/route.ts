import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { logInteraction } from "@/lib/analytics"
import { filterSensitiveContent } from "@/lib/privacy"
import { getAIService, sanitizeMessages } from "@/lib/ai"
import { rateLimit } from "@/lib/rate-limit"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// Export the handler for compatibility with tests
export default async function handler(req: Request) {
  return POST(req)
}

export async function POST(req: Request) {
  const startTime = Date.now()
  let userId = "anonymous"
  let lastUserMessage = ""

  try {
    // Check rate limiting
    const rateLimitResult = await rateLimit(req, "ai-tutor")
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          content: "You've made too many requests. Please try again later.",
          error: "RATE_LIMIT_EXCEEDED",
        },
        { status: 429 },
      )
    }

    // Extract the messages from the request body
    const { messages, user } = await req.json()

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        {
          content: "Invalid request format. Please provide a valid messages array.",
          error: "INVALID_REQUEST",
        },
        { status: 400 },
      )
    }

    // Set user ID if available
    if (user?.id) {
      userId = user.id
    }

    // Sanitize messages
    const sanitizedMessages = sanitizeMessages(messages)

    // Get the last user message
    const lastUserMessageObj = sanitizedMessages.filter((m: any) => m.role === "user").pop()
    lastUserMessage = lastUserMessageObj?.content || ""

    // Filter sensitive content
    const contentFilter = filterSensitiveContent(lastUserMessage)
    if (!contentFilter.isAllowed) {
      logger.warn("Content filter triggered", { reason: contentFilter.reason })

      // Log the filtered interaction
      await logInteraction({
        userId,
        type: "ai_tutor_filtered",
        input: lastUserMessage,
        output: "Content filtered",
        success: false,
        responseTimeMs: Date.now() - startTime,
        metadata: { reason: contentFilter.reason },
      })

      return NextResponse.json({
        content:
          "I'm unable to respond to that request as it appears to contain prohibited content. Please try a different question.",
        filtered: true,
        reason: contentFilter.reason,
      })
    }

    // Get the appropriate AI service
    const aiService = getAIService()

    // For streaming responses, return the streaming response directly
    if (req.headers.get("accept")?.includes("text/event-stream")) {
      // Log the interaction (async, don't await)
      logInteraction({
        userId,
        type: "ai_tutor_stream",
        input: lastUserMessage,
        output: "[Streaming response]",
        success: true,
        responseTimeMs: Date.now() - startTime,
        metadata: { streaming: true },
      }).catch((err) => {
        logger.error("Failed to log streaming interaction", { error: err })
      })

      try {
        // Get streaming response from AI service
        const streamResponse = aiService.streamResponse(sanitizedMessages, {
          system: "You are a helpful educational assistant that provides accurate, concise, and educational responses.",
        })

        // Ensure proper headers are set
        const headers = new Headers(streamResponse.headers)
        headers.set("Content-Type", "text/event-stream")
        headers.set("Cache-Control", "no-cache")
        headers.set("Connection", "keep-alive")

        return new Response(streamResponse.body, {
          headers,
          status: streamResponse.status,
        })
      } catch (error) {
        logger.error("Error creating streaming response", { error })

        // Return a properly formatted error stream
        const encoder = new TextEncoder()
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Failed to create stream" })}\n\n`))
            controller.close()
          },
        })

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        })
      }
    }

    // For non-streaming responses, generate and return the response
    const response = await aiService.generateResponse(sanitizedMessages, {
      system: "You are a helpful educational assistant that provides accurate, concise, and educational responses.",
    })

    // Log the interaction
    const responseTime = Date.now() - startTime
    await logInteraction({
      userId,
      type: "ai_tutor",
      input: lastUserMessage,
      output: response.content,
      success: !response.error,
      responseTimeMs: responseTime,
      metadata: response.metadata,
    })

    return NextResponse.json(response)
  } catch (error) {
    const err = error as Error
    logger.error("AI tutor error", {
      error: err.message,
      stack: err.stack,
      userId,
    })

    // Log the failed interaction
    const responseTime = Date.now() - startTime
    await logInteraction({
      userId,
      type: "ai_tutor_error",
      input: lastUserMessage,
      output: "Error response",
      success: false,
      responseTimeMs: responseTime,
      metadata: { error: err.message },
    })

    // Return a friendly error message
    return NextResponse.json(
      {
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        error: "REQUEST_PROCESSING_ERROR",
      },
      { status: 500 },
    )
  }
}
