import { NextResponse } from "next/server"
import { performAIDiagnostics } from "@/lib/ai-utils"

export async function GET(request: Request) {
  try {
    // Perform detailed diagnostics on the AI configuration
    const diagnostics = await performAIDiagnostics()

    // Get current environment variable state (without exposing actual keys)
    const envStatus = {
      openai: process.env.OPENAI_API_KEY ? "configured" : "missing",
      groq: process.env.GROQ_API_KEY ? "configured" : "missing",
      xai: process.env.XAI_API_KEY ? "configured" : "missing",
    }

    return NextResponse.json({
      status: diagnostics.availableProviders.length > 0 ? "operational" : "misconfigured",
      availableProviders: diagnostics.availableProviders,
      configurationIssues: diagnostics.configurationIssues,
      recommendations: diagnostics.recommendations,
      environment: envStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Config validation error:", error)

    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error occurred during configuration validation",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Only the owner or administrator should be able to perform config updates
export async function POST(request: Request) {
  // In a real app, you would check authentication here
  // For demonstration, we'll just check for an admin key

  try {
    const { adminKey, action } = await request.json()

    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        {
          error: "Unauthorized. Admin API key required.",
        },
        { status: 401 },
      )
    }

    if (action === "validate_keys") {
      // Perform a validation test for each configured provider
      const results = {}

      if (process.env.OPENAI_API_KEY) {
        try {
          // Here you would do a simple test call to validate the key
          results["openai"] = "valid" // Placeholder
        } catch (e) {
          results["openai"] = "invalid"
        }
      }

      // Return validation results
      return NextResponse.json({
        status: "completed",
        results,
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json(
      {
        error: "Unknown action",
      },
      { status: 400 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
