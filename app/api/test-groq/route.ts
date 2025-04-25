import { NextResponse } from "next/server"
import { GROQ_API_KEY } from "@/lib/env-config"

export async function GET() {
  try {
    // Check if Groq API key is available
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        {
          status: "error",
          message: "GROQ_API_KEY is not configured",
        },
        { status: 400 },
      )
    }

    // Make a simple request to the Groq API
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    // Check if the request was successful
    if (!response.ok) {
      const errorMessage = `Failed to connect to Groq API: ${response.status} ${response.statusText}`
      let errorDetails = ""

      try {
        const errorData = await response.json()
        errorDetails = JSON.stringify(errorData)
      } catch (e) {
        try {
          errorDetails = await response.text()
        } catch (textError) {
          errorDetails = "Could not read error response"
        }
      }

      return NextResponse.json(
        {
          status: "error",
          message: errorMessage,
          details: errorDetails,
        },
        { status: response.status },
      )
    }

    // Parse the response
    const data = await response.json()

    // Return the list of available models
    return NextResponse.json({
      status: "success",
      message: "Successfully connected to Groq API",
      models: data.data?.map((model) => model.id) || [],
      apiKeyFormat: GROQ_API_KEY.startsWith("gsk_") ? "valid" : "invalid",
    })
  } catch (error) {
    console.error("Error testing Groq API:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
