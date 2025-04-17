import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export async function POST(req: Request) {
  try {
    // Extract the feedback data from the request body
    const { messageId, isPositive, userId = "anonymous" } = await req.json()

    // Validate input
    if (!messageId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: messageId",
        },
        { status: 400 },
      )
    }

    if (typeof isPositive !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: isPositive (boolean)",
        },
        { status: 400 },
      )
    }

    // Log the feedback (in a real app, you would store this in a database)
    logger.info("AI tutor feedback received", {
      messageId,
      isPositive,
      userId,
    })

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully",
    })
  } catch (error) {
    logger.error("Feedback submission error", { error })

    return NextResponse.json(
      {
        success: false,
        error: "An error occurred while processing your feedback. Please try again.",
      },
      { status: 500 },
    )
  }
}
