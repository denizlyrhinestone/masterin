import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { groq } from "@ai-sdk/groq"
import { xai } from "@ai-sdk/xai"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { messages, userId } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new NextResponse(JSON.stringify({ error: "Invalid request. Messages array is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Log the request if LOG_LEVEL is debug
    if (process.env.LOG_LEVEL === "debug") {
      console.log("AI Tutor Request:", { userId, messageCount: messages.length })
    }

    // Determine which AI model to use based on available API keys
    let model
    if (process.env.XAI_API_KEY) {
      model = xai("grok-1")
    } else if (process.env.GROQ_API_KEY) {
      model = groq("llama3-70b-8192")
    } else {
      model = openai("gpt-3.5-turbo")
    }

    // Prepare the system message for the AI tutor
    const systemMessage = `You are an educational AI tutor. Your goal is to help students learn by guiding them through problems, not just giving answers. Ask questions to help students discover solutions themselves. Be encouraging, clear, and concise.`

    // Combine the user's messages with the system message
    const prompt = messages.map((msg) => msg.content).join("\n")

    // Generate the AI response
    const { text } = await generateText({
      model,
      system: systemMessage,
      prompt,
    })

    return NextResponse.json({
      content: text,
      timestamp: new Date().toISOString(),
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
