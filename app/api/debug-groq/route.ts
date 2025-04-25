import { NextResponse } from "next/server"
import { GROQ_API_KEY } from "@/lib/env-config"

export async function GET() {
  try {
    // Check if Groq API key is available
    const apiKeyPresent = !!GROQ_API_KEY
    const apiKeyFormat = GROQ_API_KEY.startsWith("gsk_") ? "valid" : "invalid"

    // Get masked API key (first 4 and last 4 characters)
    const maskedKey = apiKeyPresent
      ? `${GROQ_API_KEY.substring(0, 4)}...${GROQ_API_KEY.substring(GROQ_API_KEY.length - 4)}`
      : "Not configured"

    // Return diagnostic information
    return NextResponse.json({
      apiKeyPresent,
      apiKeyFormat,
      maskedKey,
      apiKeyLength: GROQ_API_KEY.length,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in debug-groq endpoint:", error)

    return NextResponse.json(
      {
        error: "An error occurred while debugging Groq",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
