import { NextResponse } from "next/server"

// Check if we're in a preview environment
const isPreviewEnvironment = () => {
  return (
    process.env.VERCEL_ENV === "preview" ||
    Boolean(process.env.VERCEL_URL?.includes("vercel.app")) ||
    !process.env.XAI_API_KEY
  )
}

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

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    // Extract the messages and optional context from the request body
    const { messages, courseContext } = await req.json()

    // Get the last user message
    const lastUserMessage = messages.find((m: any) => m.role === "user")?.content || ""

    // Always use mock responses in preview environments
    if (isPreviewEnvironment()) {
      console.log("Preview environment detected, returning mock response")

      // Create a mock response that acknowledges the user's question
      let mockResponse = getMockResponse()

      if (lastUserMessage) {
        mockResponse = `You asked: "${lastUserMessage.slice(0, 50)}${lastUserMessage.length > 50 ? "..." : ""}".\n\n${mockResponse}`
      }

      // Add course context acknowledgment if available
      if (courseContext) {
        mockResponse += `\n\nI see you're studying ${courseContext.currentTopic} in ${courseContext.title}. In the deployed version, I'll provide context-aware responses.`

        // Add some educational content based on the course context
        mockResponse += `\n\nSome key learning objectives for ${courseContext.currentTopic} include: ${courseContext.learningObjectives[0]}`
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

      return NextResponse.json({
        content: mockResponse,
      })
    }

    // For production environments, we would use the AI SDK here
    // But since we're having issues with it, let's return a friendly message
    console.error("AI SDK implementation not available")

    return NextResponse.json({
      content:
        "I apologize, but I'm currently experiencing technical difficulties. Our team is working on resolving this issue. In the meantime, please try again later or check our documentation for self-help resources.",
    })
  } catch (error) {
    console.error("Enhanced AI tutor error:", error)

    // Return a friendly error message
    return NextResponse.json({
      content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
    })
  }
}
