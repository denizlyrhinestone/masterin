import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

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

export async function POST(req: Request) {
  try {
    // Extract the message from the request body
    const { message, userId = "anonymous" } = await req.json()

    // Validate input
    if (!message) {
      return NextResponse.json(
        {
          content: "Please provide a message to get a response.",
        },
        { status: 400 },
      )
    }

    // Log the request
    logger.info("AI tutor basic request", {
      userId,
      messageLength: message.length,
    })

    // Generate a response
    let response = getMockResponse()

    // Add some context based on the message
    if (message.toLowerCase().includes("programming")) {
      response +=
        "\n\nIn programming, it's important to understand concepts like variables, functions, and data structures. These form the building blocks of any program."
    } else if (message.toLowerCase().includes("math")) {
      response +=
        "\n\nMathematics is a vast field with many branches including algebra, calculus, geometry, and statistics. Each area has its own set of principles and applications."
    } else if (message.toLowerCase().includes("language")) {
      response +=
        "\n\nLanguage learning involves vocabulary, grammar, pronunciation, and cultural understanding. Regular practice is key to mastering any new language."
    }

    // Add a delay to simulate thinking time (0.5-1.5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))

    return NextResponse.json({
      content: response,
    })
  } catch (error) {
    logger.error("AI tutor basic error", { error })

    // Return a friendly error message
    return NextResponse.json(
      {
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
      },
      { status: 500 },
    )
  }
}
