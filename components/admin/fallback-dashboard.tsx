"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle, Clock, RefreshCw, TrendingDown, TrendingUp, Minus } from "lucide-react"
import { FallbackTrigger } from "@/lib/fallback-analyzer"
import { FallbackTier } from "@/lib/tiered-fallback-strategy"

// Dashboard component for monitoring fallback responses
export function FallbackDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      // In a real app, you would get the admin token from a secure source
      const adminToken = process.env.ADMIN_API_KEY || "admin-token"

      const response = await fetch(`/api/fallback-diagnostics?token=${adminToken}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status}`)
      }

      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch dashboard data")
      console.error("Error fetching fallback dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData()

    // Set up polling every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)

    return () => clearInterval(interval)
  }, [])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300"
      case "major":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "moderate":
        return "bg-amber-100 text-amber-800 border-amber-300"
      case "minor":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Get tier color
  const getTierColor = (tier: FallbackTier) => {
    switch (tier) {
      case FallbackTier.TIER_1:
        return "bg-blue-100 text-blue-800"
      case FallbackTier.TIER_2:
        return "bg-amber-100 text-amber-800"
      case FallbackTier.TIER_3:
        return "bg-orange-100 text-orange-800"
      case FallbackTier.TIER_4:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get trigger color
  const getTriggerColor = (trigger: FallbackTrigger) => {
    switch (trigger) {
      case FallbackTrigger.API_UNAVAILABLE:
      case FallbackTrigger.AUTHENTICATION_FAILURE:
        return "bg-red-100 text-red-800"
      case FallbackTrigger.RATE_LIMITED:
      case FallbackTrigger.MODEL_OVERLOADED:
        return "bg-orange-100 text-orange-800"
      case FallbackTrigger.CONTEXT_EXCEEDED:
      case FallbackTrigger.TIMEOUT:
        return "bg-amber-100 text-amber-800"
      case FallbackTrigger.CONTENT_FILTERED:
      case FallbackTrigger.LOW_CONFIDENCE:
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Render loading state
  if (loading && !dashboardData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-gray-500" />
          <span>Loading dashboard data...</span>
        </div>
      </div>
    )
  }

  // Render error state
  if (error && !dashboardData) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span className="font-medium">Error loading dashboard:</span>
          <span>{error}</span>
        </div>
        <Button onClick={fetchDashboardData} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Fallback Response Dashboard</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Last updated: {dashboardData ? formatDate(dashboardData.timestamp) : "N/A"}
          </span>
          <Button onClick={fetchDashboardData} size="sm" variant="outline" className="h-8 gap-1">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      {dashboardData && (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Fallback Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{(dashboardData.stats.fallbackRate * 100).toFixed(1)}%</div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(dashboardData.trends.hourly.trend)}
                    <span className="text-xs">
                      {dashboardData.trends.hourly.percentChange > 0 ? "+" : ""}
                      {dashboardData.trends.hourly.percentChange.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {dashboardData.stats.totalFallbacks} fallbacks out of {dashboardData.stats.totalRequests} requests
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Active Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{dashboardData.activeIncidents.length}</div>
                  <Badge
                    variant="outline"
                    className={
                      dashboardData.activeIncidents.length === 0
                        ? "bg-green-100 text-green-800"
                        : dashboardData.activeIncidents.length > 3
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                    }
                  >
                    {dashboardData.activeIncidents.length === 0
                      ? "Healthy"
                      : dashboardData.activeIncidents.length > 3
                        ? "Critical"
                        : "Warning"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {dashboardData.activeIncidents.length === 0
                    ? "No active incidents"
                    : `${dashboardData.activeIncidents.length} active incident${
                        dashboardData.activeIncidents.length === 1 ? "" : "s"
                      }`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.stats.averageResponseTime.toFixed(0)}ms</div>
                <p className="mt-1 text-xs text-gray-500">
                  {dashboardData.stats.averageResponseTime < 1000
                    ? "Good performance"
                    : dashboardData.stats.averageResponseTime < 3000
                      ? "Acceptable performance"
                      : "Poor performance"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Last Fallback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-lg font-medium">
                    {dashboardData.stats.lastFallback
                      ? new Date(dashboardData.stats.lastFallback).toLocaleTimeString()
                      : "N/A"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {dashboardData.stats.lastFallback
                    ? `${Math.round(
                        (new Date().getTime() - new Date(dashboardData.stats.lastFallback).getTime()) / 60000,
                      )} minutes ago`
                    : "No fallbacks recorded"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="incidents">Incidents</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Trigger Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Fallback Triggers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(dashboardData.stats.fallbacksByTrigger)
                        .sort((a, b) => b[1] - a[1])
                        .filter(([_, count]) => (count as number) > 0)
                        .map(([trigger, count]) => (
                          <div key={trigger} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className={getTriggerColor(trigger as FallbackTrigger)}>
                                {trigger}
                              </Badge>
                            </div>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      {Object.values(dashboardData.stats.fallbacksByTrigger).every((v) => v === 0) && (
                        <p className="text-center text-gray-500">No fallbacks recorded</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Tier Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Fallback Tiers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(dashboardData.stats.fallbacksByTier)
                        .sort((a, b) => b[1] - a[1])
                        .filter(([_, count]) => (count as number) > 0)
                        .map(([tier, count]) => (
                          <div key={tier} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className={getTierColor(tier as FallbackTier)}>
                                {tier}
                              </Badge>
                              <span className="text-sm">
                                {tier === FallbackTier.TIER_1
                                  ? "Minimal Degradation"
                                  : tier === FallbackTier.TIER_2
                                    ? "Moderate Degradation"
                                    : tier === FallbackTier.TIER_3
                                      ? "Significant Degradation"
                                      : "Severe Degradation"}
                              </span>
                            </div>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      {Object.values(dashboardData.stats.fallbacksByTier).every((v) => v === 0) && (
                        <p className="text-center text-gray-500">No fallbacks recorded</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Subject Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Fallbacks by Subject</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(dashboardData.stats.fallbacksBySubject)
                      .sort((a, b) => b[1] - a[1])
                      .filter(([_, count]) => (count as number) > 0)
                      .map(([subject, count]) => (
                        <div key={subject} className="flex items-center justify-between rounded-lg border p-3">
                          <span className="font-medium capitalize">{subject}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    {Object.keys(dashboardData.stats.fallbacksBySubject).length === 0 && (
                      <p className="col-span-full text-center text-gray-500">No subject data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Incidents Tab */}
            <TabsContent value="incidents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Active Incidents</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData.activeIncidents.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.activeIncidents.map((incident: any) => (
                        <div
                          key={incident.id}
                          className={`rounded-lg border p-4 ${getSeverityColor(incident.severity)}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="h-5 w-5" />
                              <h3 className="font-semibold">{incident.trigger}</h3>
                            </div>
                            <Badge variant="outline" className="border-current bg-white/20">
                              {incident.severity}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm">{incident.message}</p>
                          <div className="mt-2 flex items-center justify-between text-xs">
                            <span>
                              Started: {formatDate(incident.timestamp)} • Count: {incident.consecutiveCount}
                            </span>
                            <Button size="sm" variant="outline" className="h-7 border-current bg-white/20 text-xs">
                              Resolve
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center">
                      <div className="flex flex-col items-center space-y-2 text-center">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                        <p>No active incidents</p>
                        <p className="text-xs text-gray-500">All systems are operating normally</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Incidents</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData.recentIncidents && dashboardData.recentIncidents.length > 0 ? (
                    <div className="space-y-2">
                      {dashboardData.recentIncidents
                        .filter((incident: any) => incident.resolved)
                        .slice(0, 5)
                        .map((incident: any) => (
                          <div
                            key={incident.id}
                            className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                          >
                            <div>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant="outline"
                                  className={getTriggerColor(incident.trigger as FallbackTrigger)}
                                >
                                  {incident.trigger}
                                </Badge>
                                <span className="text-sm font-medium">{incident.subject || "General"}</span>
                              </div>
                              <p className="mt-1 text-xs text-gray-500">
                                {formatDate(incident.timestamp)} • {incident.consecutiveCount} occurrences
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              Resolved
                            </Badge>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">No recent incidents</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData.recommendations && dashboardData.recommendations.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.recommendations
                        .sort((a: any, b: any) => {
                          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
                          return priorityOrder[a.priority] - priorityOrder[b.priority]
                        })
                        .map((recommendation: any) => (
                          <div
                            key={recommendation.id}
                            className="rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:bg-gray-50"
                          >
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{recommendation.title}</h3>
                              <Badge
                                variant="outline"
                                className={
                                  recommendation.priority === "critical"
                                    ? "bg-red-100 text-red-800"
                                    : recommendation.priority === "high"
                                      ? "bg-orange-100 text-orange-800"
                                      : recommendation.priority === "medium"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-blue-100 text-blue-800"
                                }
                              >
                                {recommendation.priority}
                              </Badge>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">{recommendation.description}</p>
                            <div className="mt-4 grid gap-2 md:grid-cols-2">
                              <div className="rounded-md bg-gray-100 p-2 text-sm">
                                <span className="font-medium">Action: </span>
                                {recommendation.action}
                              </div>
                              <div className="rounded-md bg-gray-100 p-2 text-sm">
                                <span className="font-medium">Impact: </span>
                                {recommendation.impact}
                              </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <Badge variant="outline">
                                {recommendation.type === "configuration"
                                  ? "Configuration"
                                  : recommendation.type === "content"
                                    ? "Content"
                                    : recommendation.type === "monitoring"
                                      ? "Monitoring"
                                      : "User Experience"}
                              </Badge>
                              <Badge variant="outline">
                                {recommendation.implementationDifficulty === "easy"
                                  ? "Easy to implement"
                                  : recommendation.implementationDifficulty === "moderate"
                                    ? "Moderate difficulty"
                                    : "Difficult to implement"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">No recommendations available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trends Tab */}
            <TabsContent value="trends" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Hourly Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(dashboardData.trends.hourly.trend)}
                      <span className="font-medium">
                        {dashboardData.trends.hourly.trend === "increasing"
                          ? "Increasing"
                          : dashboardData.trends.hourly.trend === "decreasing"
                            ? "Decreasing"
                            : "Stable"}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({dashboardData.trends.hourly.percentChange > 0 ? "+" : ""}
                        {dashboardData.trends.hourly.percentChange.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="mt-4 h-40 w-full">
                      {/* In a real implementation, you would render a chart here */}
                      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
                        <p className="text-sm text-gray-500">Hourly trend chart would be displayed here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Daily Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(dashboardData.trends.daily.trend)}
                      <span className="font-medium">
                        {dashboardData.trends.daily.trend === "increasing"
                          ? "Increasing"
                          : dashboardData.trends.daily.trend === "decreasing"
                            ? "Decreasing"
                            : "Stable"}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({dashboardData.trends.daily.percentChange > 0 ? "+" : ""}
                        {dashboardData.trends.daily.percentChange.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="mt-4 h-40 w-full">
                      {/* In a real implementation, you would render a chart here */}
                      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
                        <p className="text-sm text-gray-500">Daily trend chart would be displayed here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
