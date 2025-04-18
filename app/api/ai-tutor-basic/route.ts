import { NextResponse } from "next/server"
import { generateText } from "ai"
import { getAIModel } from "@/lib/ai-client"

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

    // Get the best available AI model
    const { model, provider, modelName } = getAIModel()
    console.log(`Using ${provider} model: ${modelName}`)

    // Generate the AI response
    const { text } = await generateText({
      model,
      system: "You are an educational AI tutor. Be helpful and concise.",
      prompt: message,
    })

    return NextResponse.json({
      content: text,
      timestamp: new Date().toISOString(),
      provider,
      model: modelName,
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
