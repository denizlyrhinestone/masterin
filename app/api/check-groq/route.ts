import { NextResponse } from "next/server"
import { GROQ_API_KEY, validateGroqApiKey } from "@/lib/env-config"
import { getMaskedApiKey } from "@/lib/groq-client"

export async function GET() {
  try {
    // Validate the API key
    const validation = validateGroqApiKey()

    // If API key is not valid, return the validation result
    if (!validation.valid) {
      return NextResponse.json({
        status: "unavailable",
        message: validation.message,
        apiKeyPresent: !!GROQ_API_KEY,
        apiKeyFormat: GROQ_API_KEY ? "invalid" : "missing",
        maskedKey: getMaskedApiKey(),
      })
    }

    // Try a simple API call to check if the key works
    try {
      const startTime = Date.now()

      // Make a direct fetch to Groq API instead of using the SDK
      const response = await fetch("https://api.groq.com/openai/v1/models", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const duration = Date.now() - startTime

      return NextResponse.json({
        status: "available",
        message: "Groq API is working correctly",
        apiKeyPresent: true,
        apiKeyFormat: "valid",
        maskedKey: getMaskedApiKey(),
        responseTime: duration,
      })
    } catch (apiError) {
      return NextResponse.json({
        status: "error",
        message: "Groq API key is present but the API call failed",
        apiKeyPresent: true,
        apiKeyFormat: "valid",
        maskedKey: getMaskedApiKey(),
        error: apiError instanceof Error ? apiError.message : String(apiError),
      })
    }
  } catch (error) {
    console.error("Error checking Groq API:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "An error occurred while checking the Groq API",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
