import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { logFeedback } from "@/lib/analytics"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(req: Request) {
  try {
    // Check rate limiting
    const rateLimitResult = await rateLimit(req, "feedback")
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "RATE_LIMIT_EXCEEDED",
          message: "You've made too many requests. Please try again later.",
        },
        { status: 429 },
      )
    }

    // Extract the feedback data from the request body
    const { messageId, isPositive, userId = "anonymous", feedbackText } = await req.json()

    // Validate input
    if (!messageId) {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_REQUEST",
          message: "Missing required field: messageId",
        },
        { status: 400 },
      )
    }

    if (typeof isPositive !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_REQUEST",
          message: "Missing required field: isPositive (boolean)",
        },
        { status: 400 },
      )
    }

    // Log the feedback
    const success = await logFeedback(userId, messageId, isPositive, feedbackText)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "FEEDBACK_LOGGING_FAILED",
          message: "Failed to log feedback. Please try again.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
    })
  } catch (error) {
    const err = error as Error
    logger.error("Feedback submission error", {
      error: err.message,
      stack: err.stack,
    })

    return NextResponse.json(
      {
        success: false,
        error: "REQUEST_PROCESSING_ERROR",
        message: "An error occurred while processing your feedback. Please try again.",
      },
      { status: 500 },
    )
  }
}
