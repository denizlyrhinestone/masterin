import { NextResponse } from "next/server"
import { serviceHealthMonitor, ServiceType } from "@/lib/service-health"
import { featureFlags } from "@/lib/feature-flags"
import { errorMonitor } from "@/lib/error-monitoring"
import { selectAIModel } from "@/lib/ai-utils"

export async function GET(request: Request) {
  try {
    // Get service health information
    const serviceHealth = Object.fromEntries(serviceHealthMonitor.getAllServiceHealth())

    // Get feature availability
    const featureStatus = featureFlags.getAllFeatureStatuses()

    // Get error statistics
    const errorStats = errorMonitor.getErrorStats()

    // Check which AI model is currently selected
    const { provider } = selectAIModel()

    // Determine overall system health
    const aiServicesOperational = [
      serviceHealthMonitor.isServiceAvailable(ServiceType.OPENAI),
      serviceHealthMonitor.isServiceAvailable(ServiceType.GROQ),
      serviceHealthMonitor.isServiceAvailable(ServiceType.XAI),
    ].some(Boolean)

    const databaseOperational = serviceHealthMonitor.isServiceAvailable(ServiceType.DATABASE)
    const authOperational = serviceHealthMonitor.isServiceAvailable(ServiceType.AUTHENTICATION)

    let systemStatus = "operational"
    if (!aiServicesOperational && !databaseOperational) {
      systemStatus = "major_outage"
    } else if (!aiServicesOperational || !databaseOperational) {
      systemStatus = "partial_outage"
    } else if (
      serviceHealthMonitor.isServiceDegraded(ServiceType.OPENAI) ||
      serviceHealthMonitor.isServiceDegraded(ServiceType.DATABASE)
    ) {
      systemStatus = "degraded"
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: systemStatus,
      services: serviceHealth,
      features: featureStatus,
      currentProvider: provider,
      errors: {
        total: errorStats.totalErrors,
        byCategory: errorStats.counts,
      },
    })
  } catch (error) {
    console.error("Health check error:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to retrieve health information",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
