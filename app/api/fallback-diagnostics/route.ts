import { NextResponse } from "next/server"
import { FallbackAnalyzer, FallbackTrigger } from "@/lib/fallback-analyzer"
import { TieredFallbackStrategy, FallbackTier } from "@/lib/tiered-fallback-strategy"
import { FallbackMonitor } from "@/lib/fallback-monitor"
import { logError } from "@/lib/error-handling"

// Get fallback diagnostic data
export async function GET(request: Request) {
  try {
    // Check for authentication
    // In a real app, you would verify the user has admin permissions
    const url = new URL(request.url)
    const authToken = url.searchParams.get("token")

    if (authToken !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 })
    }

    // Get data from fallback analyzer
    const fallbackAnalyzer = FallbackAnalyzer.getInstance()
    const activeIncidents = fallbackAnalyzer.getActiveIncidents()
    const allIncidents = fallbackAnalyzer.getAllIncidents()
    const triggerCounts = fallbackAnalyzer.getTriggerCounts()

    // Get data from fallback monitor
    const fallbackMonitor = FallbackMonitor.getInstance()
    const stats = fallbackMonitor.getStats()
    const trends = fallbackMonitor.getTrends()
    const recommendations = fallbackMonitor.getRecommendations()

    // Get fallback strategy config
    const fallbackStrategy = TieredFallbackStrategy.getInstance()
    const fallbackConfig = fallbackStrategy.getConfig()

    // Return diagnostic data
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      activeIncidents,
      recentIncidents: allIncidents.slice(-10), // Last 10 incidents
      triggerCounts: Object.fromEntries(triggerCounts),
      stats,
      trends,
      recommendations,
      fallbackConfig,
    })
  } catch (error) {
    // Log the error
    logError(error instanceof Error ? error : String(error), "FallbackDiagnosticsAPI.GET", {})

    return NextResponse.json(
      {
        error: "Failed to retrieve fallback diagnostic data",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// Perform fallback diagnostic actions
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
      case "resolve_incident":
        return await handleResolveIncident(params)

      case "test_fallback":
        return await handleTestFallback(params)

      case "update_fallback_config":
        return await handleUpdateFallbackConfig(params)

      case "clear_fallback_data":
        return await handleClearFallbackData()

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    // Log the error
    logError(error instanceof Error ? error : String(error), "FallbackDiagnosticsAPI.POST", {})

    return NextResponse.json(
      {
        error: "Failed to perform fallback diagnostic action",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// Handle resolve incident action
async function handleResolveIncident(params: any) {
  const { incidentId, resolution } = params

  if (!incidentId) {
    return NextResponse.json({ error: "Incident ID is required" }, { status: 400 })
  }

  const fallbackAnalyzer = FallbackAnalyzer.getInstance()
  const incidents = fallbackAnalyzer.getActiveIncidents()
  const incident = incidents.find((inc) => inc.id === incidentId)

  if (!incident) {
    return NextResponse.json({ error: "Incident not found" }, { status: 404 })
  }

  const resolvedIncident = fallbackAnalyzer.resolveFallback(incident.trigger, incident.subject, resolution)

  return NextResponse.json({
    success: true,
    incident: resolvedIncident,
  })
}

// Handle test fallback action
async function handleTestFallback(params: any) {
  const { trigger = FallbackTrigger.UNKNOWN, subject = "general", tier = FallbackTier.TIER_2 } = params

  const fallbackAnalyzer = FallbackAnalyzer.getInstance()
  const fallbackStrategy = TieredFallbackStrategy.getInstance()

  // Record a test fallback incident
  const incident = fallbackAnalyzer.recordFallback(trigger, `Test fallback for ${trigger}`, {
    subject,
    topic: "general",
    errorCode: "TEST_ERROR",
  })

  // Get fallback content for the incident
  const fallbackContent = fallbackStrategy.getFallbackContent(subject, "general", {
    tier: tier as FallbackTier,
    trigger: trigger as FallbackTrigger,
  })

  return NextResponse.json({
    success: true,
    incident,
    fallbackContent,
  })
}

// Handle update fallback config action
async function handleUpdateFallbackConfig(params: any) {
  const fallbackStrategy = TieredFallbackStrategy.getInstance()

  // Update the fallback strategy config
  fallbackStrategy.updateConfig(params)

  // Get the updated config
  const updatedConfig = fallbackStrategy.getConfig()

  return NextResponse.json({
    success: true,
    config: updatedConfig,
  })
}

// Handle clear fallback data action
async function handleClearFallbackData() {
  const fallbackAnalyzer = FallbackAnalyzer.getInstance()
  const fallbackMonitor = FallbackMonitor.getInstance()

  // Clear fallback data
  fallbackAnalyzer.clearData()
  fallbackMonitor.clearData()

  return NextResponse.json({
    success: true,
    message: "Fallback data cleared successfully",
  })
}
