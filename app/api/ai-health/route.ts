import { NextResponse } from "next/server"
import { selectAIModel, getAIServiceHealthReport, checkProviderHealth } from "@/lib/ai-utils"

export async function GET() {
  try {
    // Get current health status of AI services
    const healthReport = getAIServiceHealthReport()

    // Check which AI model is currently selected
    const { model, provider } = selectAIModel()

    // Check if we have valid API keys
    const apiKeyStatus = {
      openai: !!process.env.OPENAI_API_KEY,
      groq: !!process.env.GROQ_API_KEY,
      xai: !!process.env.XAI_API_KEY,
    }

    // Prepare the response with diagnostics
    const response = {
      status: provider !== "fallback" && model ? "operational" : "degraded",
      timestamp: new Date().toISOString(),
      activeProvider: provider,
      hasModel: model !== null,
      services: healthReport,
      apiKeys: apiKeyStatus,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Health check error:", error)

    return NextResponse.json(
      {
        status: "error",
        error: "Failed to check AI service health",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    // Force a health check on all providers
    const results = {
      openai: process.env.OPENAI_API_KEY ? await checkProviderHealth("openai") : false,
      groq: process.env.GROQ_API_KEY ? await checkProviderHealth("groq") : false,
      xai: process.env.XAI_API_KEY ? await checkProviderHealth("xai") : false,
    }

    // Get updated health report after checks
    const healthReport = getAIServiceHealthReport()

    return NextResponse.json({
      status: "completed",
      results,
      healthReport,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Health check error:", error)

    return NextResponse.json(
      {
        status: "error",
        error: "Failed to run health checks",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
