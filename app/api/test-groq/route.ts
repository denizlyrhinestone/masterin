import { NextResponse } from "next/server"
import { GROQ_API_KEY } from "@/lib/env-config"

export async function GET() {
  try {
    // Check if API key is configured
    if (!GROQ_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "Groq API key is not configured",
      })
    }

    // Simple test request to Groq API
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json({
        success: false,
        error: `Groq API returned an error: ${response.status} ${response.statusText}`,
        details: errorData,
      })
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Groq API",
      models: data.data?.length || 0,
    })
  } catch (error) {
    console.error("Error testing Groq API:", error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    })
  }
}
