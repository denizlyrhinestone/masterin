import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"
import { NextResponse } from "next/server"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Use the Groq API to generate a response
    const result = streamText({
      model: groq("llama3-70b-8192"),
      system:
        "You are an AI tutor from Masterin, an educational platform. Your goal is to help students learn by providing clear, accurate, and helpful explanations. Focus on being educational, supportive, and engaging. When appropriate, format your responses with markdown for better readability. Include examples, analogies, and step-by-step explanations to help students understand complex topics.",
      messages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 })
  }
}
