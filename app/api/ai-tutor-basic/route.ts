import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { groq } from "@ai-sdk/groq"
import { xai } from "@ai-sdk/xai"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, userId } = body

    if (!message) {
      return new NextResponse(JSON.stringify({ error: "Invalid request. Message is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
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

    // Generate the AI response
    const { text } = await generateText({
      model,
      system: "You are an educational AI tutor. Be helpful and concise.",
      prompt: message,
    })

    return NextResponse.json({
      content: text,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("AI Tutor Basic API Error:", error)
    return new NextResponse(
      JSON.stringify({
        error: "Failed to process AI tutor request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
