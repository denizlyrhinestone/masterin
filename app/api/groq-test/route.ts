import { NextResponse } from "next/server"
import { GROQ_API_KEY } from "@/lib/env-config"

export async function POST(request: Request) {
  try {
    // Check if Groq API key is available
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: "GROQ_API_KEY is not configured",
        },
        { status: 400 },
      )
    }

    // Get the prompt from the request body
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        {
          success: false,
          message: "Prompt is required",
        },
        { status: 400 },
      )
    }

    // Make a request to the Groq API
    const startTime = Date.now()

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    })

    const responseTime = Date.now() - startTime

    if (!response.ok) {
      const errorData = await response.text()
      return NextResponse.json(
        {
          success: false,
          message: `Groq API request failed with status ${response.status}`,
          error: errorData,
          responseTime,
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: "Groq API connection successful",
      response: data.choices[0].message.content,
      model: data.model,
      responseTime,
    })
  } catch (error) {
    console.error("Error testing Groq API:", error)

    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while testing the Groq API",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
