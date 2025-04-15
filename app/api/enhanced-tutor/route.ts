import { NextResponse } from "next/server"
import { streamText } from "ai"
import { xai } from "@ai-sdk/xai"
import { headers } from "next/headers"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    // Extract the messages and optional context from the request body
    const { messages, courseContext } = await req.json()

    // Get user identifier from headers (in a real app, this would be a user ID)
    const headersList = headers()
    const userId = headersList.get("x-user-id") || "anonymous"

    // Create a system message that includes course context if provided
    let systemContent = `You are an AI educational assistant specialized in helping students learn various subjects.
      - Provide clear, concise explanations
      - Break down complex topics into simpler parts
      - Use examples to illustrate concepts
      - Encourage critical thinking
      - Provide practice problems when appropriate
      - Be encouraging and supportive
      - If you don't know something, admit it rather than making up information`

    // Add course-specific context if provided
    if (courseContext) {
      systemContent += `\n\nThe student is currently studying: ${courseContext.title}
      Course description: ${courseContext.description}
      Current topic: ${courseContext.currentTopic}
      Learning objectives: ${courseContext.learningObjectives.join(", ")}`
    }

    // Create the system message
    const systemMessage = {
      role: "system",
      content: systemContent,
    }

    // Prepend the system message to the conversation
    const augmentedMessages = [systemMessage, ...messages]

    // Call the language model using the AI SDK with Grok
    const result = streamText({
      model: xai("grok-3-mini-beta"),
      messages: augmentedMessages,
    })

    // Return the streaming response
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Enhanced AI tutor error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
