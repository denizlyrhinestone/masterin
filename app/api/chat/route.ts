import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import platformInfo from "@/lib/platform-info"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    // Parse request body
    let messages
    try {
      const body = await req.json()
      messages = body.messages
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request format: messages must be an array" }, { status: 400 })
    }

    // Create a guest user ID
    const userId = `guest-${uuidv4()}`

    // Create a conversation ID
    const conversationId = `guest-${uuidv4()}`

    // Get the latest user message
    const latestUserMessage = messages.filter((m) => m.role === "user").pop()

    // Generate a simple response based on the user's message
    let responseContent = "I'm here to help with your questions about our platform. What would you like to know?"

    if (latestUserMessage) {
      const userMessage = latestUserMessage.content.toLowerCase()

      // Simple pattern matching for common questions
      if (userMessage.includes("pricing") || userMessage.includes("cost") || userMessage.includes("price")) {
        responseContent = `${platformInfo.name} offers several pricing plans to fit different needs. We have a Free Trial, Premium plan at $9.99/month, and Team plan at $29.99/month. Each plan includes different features and capabilities.`
      } else if (userMessage.includes("feature") || userMessage.includes("tool") || userMessage.includes("offer")) {
        responseContent = `${platformInfo.name} offers several AI-powered learning tools including an AI Tutor for personalized explanations, Essay Assistant for writing help, Math Problem Solver, and more.`
      } else if (userMessage.includes("subject") || userMessage.includes("topic") || userMessage.includes("learn")) {
        responseContent = `We cover a wide range of subjects including Mathematics, Science, Computer Science, and Humanities. Our AI tutor can help with questions in any of these areas.`
      } else if (userMessage.includes("hello") || userMessage.includes("hi") || userMessage.includes("hey")) {
        responseContent = `Hello! I'm your AI assistant from ${platformInfo.name}. How can I help you today?`
      } else {
        responseContent = `Thank you for your question about "${latestUserMessage.content}". To get a more detailed response, please click the "Open Full Chat" button below where our advanced AI can provide comprehensive assistance.`
      }
    }

    // Return a simple response
    return NextResponse.json({
      role: "assistant",
      content: responseContent,
      conversationId: conversationId,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      {
        role: "assistant",
        content:
          "I apologize, but I'm experiencing technical difficulties at the moment. Please try again in a few moments.",
        error: "An error occurred while processing your request",
      },
      { status: 200 }, // Return 200 even for errors to prevent client-side error handling
    )
  }
}
