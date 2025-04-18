import { NextResponse } from "next/server"
import { generateText } from "ai"
import { getAIModel, getAITutorSystemMessage } from "@/lib/ai-client"
import type { Message } from "ai"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { messages, userId, subject, sessionId } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new NextResponse(JSON.stringify({ error: "Invalid request. Messages array is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Log the request if LOG_LEVEL is debug
    if (process.env.LOG_LEVEL === "debug") {
      console.log("AI Tutor Request:", {
        userId,
        sessionId,
        subject,
        messageCount: messages.length,
      })
    }

    // Get the best available AI model
    const { model, provider, modelName } = getAIModel()
    console.log(`Using ${provider} model: ${modelName}`)

    // Get the system message for the AI tutor
    const systemMessage = getAITutorSystemMessage(subject)

    // Format messages for the AI model
    const formattedMessages = messages.map((msg: Message) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Generate the AI response
    const { text } = await generateText({
      model,
      system: systemMessage,
      messages: formattedMessages,
    })

    return NextResponse.json({
      content: text,
      timestamp: new Date().toISOString(),
      provider,
      model: modelName,
      sessionId: sessionId || `session_${Date.now()}`,
    })
  } catch (error) {
    console.error("AI Tutor API Error:", error)
    return new NextResponse(
      JSON.stringify({
        error: "Failed to process AI tutor request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
