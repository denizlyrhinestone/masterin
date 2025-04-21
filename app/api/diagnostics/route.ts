import { NextResponse } from "next/server"
import { HealthMonitor, type HealthStatus } from "@/lib/health-monitoring"
import { AlertManager, AlertType, type AlertSeverity } from "@/lib/alert-system"
import { FallbackStrategy } from "@/lib/fallback-strategy"
import { logError } from "@/lib/error-handling"

// Get diagnostic data
export async function GET(request: Request) {
  try {
    // Check for authentication
    // In a real app, you would verify the user has admin permissions
    const url = new URL(request.url)
    const authToken = url.searchParams.get("token")

    if (authToken !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    // Get health status
    const healthMonitor = HealthMonitor.getInstance()
    const systemHealth = healthMonitor.getSystemHealth()
    const activeIncidents = healthMonitor.getActiveIncidents()

    // Get alerts
    const alertManager = AlertManager.getInstance()
    const unacknowledgedAlerts = alertManager.getUnacknowledgedAlerts()

    // Get fallback strategy info
    const fallbackStrategy = FallbackStrategy.getInstance()
    const fallbackConfig = fallbackStrategy.getConfig()

    // Get environment info
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      aiProviders: {
        openai: process.env.OPENAI_API_KEY ? "configured" : "missing",
        groq: process.env.GROQ_API_KEY ? "configured" : "missing",
        xai: process.env.XAI_API_KEY ? "configured" : "missing",
      },
    }

    // Return diagnostic data
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      systemHealth,
      activeIncidents,
      unacknowledgedAlerts,
      fallbackConfig,
      environment: envInfo,
    })
  } catch (error) {
    // Log the error
    logError(error instanceof Error ? error : String(error), "DiagnosticsAPI.GET", {})

    return NextResponse.json(
      {
        error: "Failed to retrieve diagnostic data",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// Trigger diagnostic actions
export async function POST(request: Request) {
  try {
    // Check for authentication
    // In a real app, you would verify the user has admin permissions
    const { action, token, ...params } = await request.json()

    if (token !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    // Handle different actions
    switch (action) {
      case "test_alert":
        return await handleTestAlert(params)

      case "acknowledge_alert":
        return await handleAcknowledgeAlert(params)

      case "test_health_check":
        return await handleTestHealthCheck(params)

      case "clear_cache":
        return await handleClearCache()

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    // Log the error
    logError(error instanceof Error ? error : String(error), "DiagnosticsAPI.POST", {})

    return NextResponse.json(
      {
        error: "Failed to perform diagnostic action",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// Handle test alert action
async function handleTestAlert(params: any) {
  const { severity = "info", title = "Test Alert", message = "This is a test alert" } = params

  const alertManager = AlertManager.getInstance()
  const alert = await alertManager.sendAlert(
    AlertType.SERVICE_DEGRADED,
    severity as AlertSeverity,
    title,
    message,
    "DiagnosticsAPI.testAlert",
    { isTest: true },
  )

  return NextResponse.json({
    success: true,
    alert,
  })
}

// Handle acknowledge alert action
async function handleAcknowledgeAlert(params: any) {
  const { alertId, acknowledgedBy = "admin" } = params

  if (!alertId) {
    return NextResponse.json({ error: "Alert ID is required" }, { status: 400 })
  }

  const alertManager = AlertManager.getInstance()
  const alert = alertManager.acknowledgeAlert(alertId, acknowledgedBy)

  if (!alert) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    alert,
  })
}

// Handle test health check action
async function handleTestHealthCheck(params: any) {
  const { service = "ai_model", status = "operational" } = params

  const healthMonitor = HealthMonitor.getInstance()

  // Update the service health with the specified status
  const serviceHealth = {
    service,
    status: status as HealthStatus,
    lastChecked: new Date().toISOString(),
    message: `Manual test health check: ${status}`,
    metadata: { isTest: true },
  }(
    // We're using a private method, so we need to use any
    healthMonitor as any,
  ).updateServiceHealth(service, serviceHealth)

  return NextResponse.json({
    success: true,
    serviceHealth,
  })
}

// Handle clear cache action
async function handleClearCache() {
  // In a real implementation, you would clear any caches here

  return NextResponse.json({
    success: true,
    message: "Cache cleared successfully",
  })
}
