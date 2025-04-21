import { NextResponse } from "next/server"
import { selectAIModel, getAIServiceHealthReport, performAIDiagnostics } from "@/lib/ai-utils"

export async function GET() {
  try {
    // Get current health status of AI services
    const healthReport = getAIServiceHealthReport()

    // Perform detailed AI service diagnostics
    const diagnostics = await performAIDiagnostics()

    // Check which AI model is currently selected
    const { model, provider } = selectAIModel()

    // Test API key presence (not exposing actual values)
    const apiKeyStatus = {
      openai: process.env.OPENAI_API_KEY ? "configured" : "missing",
      groq: process.env.GROQ_API_KEY ? "configured" : "missing",
      xai: process.env.XAI_API_KEY ? "configured" : "missing",
    }

    // Determine overall status
    let overallStatus = "operational"
    if (diagnostics.availableProviders.length === 0) {
      overallStatus = "offline"
    } else if (diagnostics.configurationIssues.length > 0) {
      overallStatus = "degraded"
    }

    // Prepare the response with diagnostics
    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      currentProvider: provider,
      hasModel: model !== null,
      services: healthReport,
      apiKeys: apiKeyStatus,
      diagnostics: diagnostics,
      recommendations: diagnostics.recommendations,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Health check error:", error)

    return NextResponse.json(
      {
        status: "error",
        error: "Failed to check AI service health",
        timestamp: new Date().toISOString(),
        errorDetails: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
