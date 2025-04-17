import { logger } from "../logger"

// Mock responses for preview environments
const MOCK_RESPONSES = [
  "I'm a simulated AI tutor response in the preview environment. In the actual deployment, this would be powered by a real AI model.",
  "This is a mock response since we're in a preview environment. The full AI capabilities will be available in the deployed version.",
  "I'm currently in preview mode with limited capabilities. In the full version, I can provide detailed educational assistance.",
  "As a preview version, I'm showing you a simulated response. The deployed version will connect to an actual AI model.",
  "This is an example of how I would respond. In the actual deployment, I'll be able to provide personalized educational content.",
]

// Get a random mock response
function getMockResponse(): string {
  const randomIndex = Math.floor(Math.random() * MOCK_RESPONSES.length)
  return MOCK_RESPONSES[randomIndex]
}

// Generate a contextual mock response based on user input
function generateContextualResponse(lastUserMessage: string): string {
  let mockResponse = getMockResponse()

  if (lastUserMessage) {
    mockResponse = `You asked: "${lastUserMessage.slice(0, 50)}${lastUserMessage.length > 50 ? "..." : ""}".\n\n${mockResponse}`
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

  return mockResponse
}

// Generate a response using mock implementation
export async function generateResponse(
  messages: any[],
  options: any = {},
): Promise<{
  content: string
  metadata?: any
}> {
  logger.info("Using mock AI response generator")

  // Add a delay to simulate thinking time (0.5-1.5 seconds)
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))

  // Get the last user message
  const lastUserMessage = messages.filter((m) => m.role === "user").pop()?.content || ""

  const response = generateContextualResponse(lastUserMessage)

  return {
    content: response,
    metadata: { mock: true },
  }
}

function getResponseForMessage(message: string): string {
  return generateContextualResponse(message)
}

// Stream a response using mock implementation
export function streamResponse(messages: any[], options?: any): Response {
  logger.debug("Mock AI streaming response", { messageCount: messages.length })

  // Get the last user message
  const lastUserMessage = messages.filter((m) => m.role === "user").pop()?.content || "Hello"

  // Generate a response based on the message
  const response = getResponseForMessage(lastUserMessage)

  // Create a ReadableStream to simulate streaming
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      let index = 0

      // Send the response in chunks to simulate streaming
      const interval = setInterval(() => {
        if (index >= response.length) {
          controller.close()
          clearInterval(interval)
          return
        }

        // Send a few characters at a time
        const chunk = response.slice(index, index + 3)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`))
        index += 3
      }, 50)
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
