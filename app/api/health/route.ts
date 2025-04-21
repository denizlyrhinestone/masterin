import { NextResponse } from "next/server"
import { selectAIModel, getAIServiceHealthReport } from "@/lib/ai-utils"

export async function GET() {
  try {
    // Get current health status of AI services
    const healthReport = getAIServiceHealthReport()

    // Check which AI model is currently selected
    const { model, provider } = selectAIModel()

    // Prepare the response with diagnostics
    const response = {
      status: "operational",
      timestamp: new Date().toISOString(),
      provider: provider,
      hasModel: model !== null,
      services: healthReport,
      environment: {
        hasOpenAI: !!process.env.OPENAI_API_KEY,
        hasGroq: !!process.env.GROQ_API_KEY,
        hasXAI: !!process.env.XAI_API_KEY,
      },
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
