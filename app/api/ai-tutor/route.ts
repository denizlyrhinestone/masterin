import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { rateLimit } from "@/lib/rate-limit"

// Mock responses for preview environments
const MOCK_RESPONSES = [
  "I'm a simulated AI tutor response in the preview environment. In the actual deployment, this would be powered by a real AI model.",
  "This is a mock response since we're in a preview environment. The full AI capabilities will be available in the deployed version.",
  "I'm currently in preview mode with limited capabilities. In the full version, I can provide detailed educational assistance.",
  "As a preview version, I'm showing you a simulated response. The deployed version will connect to an actual AI model.",
  "This is an example of how I would respond. In the actual deployment, I'll be able to provide personalized educational content.",
]

// Get a random mock response
const getMockResponse = () => {
  const randomIndex = Math.floor(Math.random() * MOCK_RESPONSES.length)
  return MOCK_RESPONSES[randomIndex]
}

// Check if we're in a preview environment
const isPreviewEnvironment = () => {
  return (
    process.env.VERCEL_ENV === "preview" ||
    Boolean(process.env.VERCEL_URL?.includes("vercel.app")) ||
    !process.env.XAI_API_KEY
  )
}

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

    // Set user ID if available
    userId = user?.id || "anonymous"

    // Get the last user message
    lastUserMessage = messages.filter((m: any) => m.role === "user").pop()?.content || ""

    // Always use mock responses in preview environments
    if (isPreviewEnvironment()) {
      logger.info("Using mock AI response in preview environment")

      // Create a mock response that acknowledges the user's question
      let mockResponse = getMockResponse()

      if (lastUserMessage) {
        mockResponse = `You asked: "${lastUserMessage.slice(0, 50)}${lastUserMessage.length > 50 ? "..." : ""}".

${mockResponse}`
      }

      // Add some educational content based on the message
      if (lastUserMessage.toLowerCase().includes("programming")) {
        mockResponse +=
          "\n\nIn programming, it's important to understand concepts like variables, functions, and data structures. These form the building blocks of any program."
      } else if (lastUserMessage.toLowerCase().includes("math")) {
        mockResponse +=
          "\n\nMathematics is a vast field with many branches including algebra, calculus, geometry, and statistics. Each area has its own set of principles and applications."
      } else if (lastUserMessage.toLowerCase().includes("language")) {
        mockResponse +=
          "\n\nLanguage learning involves vocabulary, grammar, pronunciation, and cultural understanding. Regular practice is key to mastering any new language."
      }

      // Add a delay to simulate thinking time (0.5-1.5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))

      return NextResponse.json({ content: mockResponse })
    }

    // For production environments with XAI_API_KEY
    if (process.env.XAI_API_KEY) {
      try {
        // This would be where you'd call the actual AI service
        // For now, we'll return a placeholder response
        return NextResponse.json({
          content: "I'm your AI tutor. This is a placeholder response until the AI service is fully configured.",
        })
      } catch (aiError) {
        logger.error("AI service error", { error: aiError })
        return NextResponse.json({
          content:
            "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        })
      }
    }

    // Fallback response if no AI service is available
    return NextResponse.json({
      content: "I apologize, but the AI tutor service is currently unavailable. Please try again later.",
    })
  } catch (error) {
    logger.error("AI tutor API error", { error })

    // Return a friendly error message
    return NextResponse.json(
      {
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
      },
      { status: 500 },
    )
  }
}
