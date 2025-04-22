import { FallbackTrigger, type FallbackIncident, FallbackSeverity } from "./fallback-analyzer"
import { FallbackTier } from "./tiered-fallback-strategy"

// Interface for fallback response statistics
export interface FallbackStats {
  totalFallbacks: number
  fallbackRate: number // Percentage of total requests
  fallbacksByTrigger: Record<FallbackTrigger, number>
  fallbacksByTier: Record<FallbackTier, number>
  fallbacksBySeverity: Record<FallbackSeverity, number>
  fallbacksBySubject: Record<string, number>
  averageResponseTime: number
  consecutiveMax: number
  lastFallback: Date | null
  activeIncidents: number
}

// Interface for fallback response trend
export interface FallbackTrend {
  period: "hour" | "day" | "week"
  data: {
    timestamp: Date
    count: number
    rate: number
  }[]
  trend: "increasing" | "decreasing" | "stable"
  percentChange: number
}

// Interface for fallback response recommendation
export interface FallbackRecommendation {
  id: string
  type: "configuration" | "content" | "monitoring" | "user_experience"
  priority: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  action: string
  impact: string
  implementationDifficulty: "easy" | "moderate" | "difficult"
}

// Class to monitor fallback responses
export class FallbackMonitor {
  private static instance: FallbackMonitor
  private fallbackResponses: {
    id: string
    timestamp: Date
    trigger: FallbackTrigger
    tier: FallbackTier
    severity: FallbackSeverity
    subject?: string
    topic?: string
    responseTime?: number
    consecutiveCount: number
  }[] = []
  private totalRequests = 0
  private hourlyStats: Map<string, { fallbacks: number; total: number }> = new Map()
  private dailyStats: Map<string, { fallbacks: number; total: number }> = new Map()
  private recommendations: FallbackRecommendation[] = []

  private constructor() {
    // Initialize with some default recommendations
    this.addDefaultRecommendations()
  }

  // Singleton pattern
  public static getInstance(): FallbackMonitor {
    if (!FallbackMonitor.instance) {
      FallbackMonitor.instance = new FallbackMonitor()
    }
    return FallbackMonitor.instance
  }

  // Add default recommendations
  private addDefaultRecommendations(): void {
    this.recommendations.push({
      id: "rec-1",
      type: "configuration",
      priority: "medium",
      title: "Implement response caching",
      description: "Cache successful responses to reduce fallbacks during API unavailability.",
      action: "Enable response caching in the TieredFallbackStrategy configuration.",
      impact: "Reduces fallbacks during temporary API outages.",
      implementationDifficulty: "easy",
    })

    this.recommendations.push({
      id: "rec-2",
      type: "content",
      priority: "high",
      title: "Expand offline content library",
      description: "Add more subject-specific offline content for common topics.",
      action: "Register additional offline content for popular subjects and topics.",
      impact: "Improves quality of fallback responses during complete outages.",
      implementationDifficulty: "moderate",
    })

    this.recommendations.push({
      id: "rec-3",
      type: "monitoring",
      priority: "medium",
      title: "Implement proactive health checks",
      description: "Periodically check AI service health to detect issues before users encounter them.",
      action: "Set up scheduled health checks and preemptively switch to fallback mode when issues are detected.",
      impact: "Reduces user-facing errors by detecting issues early.",
      implementationDifficulty: "moderate",
    })
  }

  // Record a successful request (no fallback)
  public recordSuccessfulRequest(): void {
    this.totalRequests++
    this.updateTimeBasedStats(false)
  }

  // Record a fallback response
  public recordFallbackResponse(
    incident: FallbackIncident,
    tier: FallbackTier,
    metadata: {
      subject?: string
      topic?: string
      responseTime?: number
    } = {},
  ): void {
    this.totalRequests++
    this.updateTimeBasedStats(true)

    this.fallbackResponses.push({
      id: `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      trigger: incident.trigger,
      tier,
      severity: incident.severity,
      subject: metadata.subject,
      topic: metadata.topic,
      responseTime: metadata.responseTime,
      consecutiveCount: incident.consecutiveCount,
    })

    // Generate recommendations based on patterns
    this.generateRecommendations()
  }

  // Update time-based statistics
  private updateTimeBasedStats(isFallback: boolean): void {
    const now = new Date()

    // Update hourly stats
    const hourKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`
    const hourStat = this.hourlyStats.get(hourKey) || { fallbacks: 0, total: 0 }
    hourStat.total++
    if (isFallback) hourStat.fallbacks++
    this.hourlyStats.set(hourKey, hourStat)

    // Update daily stats
    const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
    const dayStat = this.dailyStats.get(dayKey) || { fallbacks: 0, total: 0 }
    dayStat.total++
    if (isFallback) dayStat.fallbacks++
    this.dailyStats.set(dayKey, dayStat)

    // Prune old stats
    this.pruneStats()
  }

  // Prune old statistics
  private pruneStats(): void {
    const now = new Date()

    // Keep hourly stats for 48 hours
    for (const [key, _] of this.hourlyStats) {
      const [year, month, day, hour] = key.split("-").map(Number)
      const statDate = new Date(year, month, day, hour)
      if (now.getTime() - statDate.getTime() > 48 * 60 * 60 * 1000) {
        this.hourlyStats.delete(key)
      }
    }

    // Keep daily stats for 30 days
    for (const [key, _] of this.dailyStats) {
      const [year, month, day] = key.split("-").map(Number)
      const statDate = new Date(year, month, day)
      if (now.getTime() - statDate.getTime() > 30 * 24 * 60 * 60 * 1000) {
        this.dailyStats.delete(key)
      }
    }
  }

  // Generate recommendations based on fallback patterns
  private generateRecommendations(): void {
    const stats = this.getStats()

    // Clear dynamic recommendations (keep default ones)
    this.recommendations = this.recommendations.filter((rec) => ["rec-1", "rec-2", "rec-3"].includes(rec.id))

    // High fallback rate recommendation
    if (stats.fallbackRate > 0.2) {
      // More than 20% fallback rate
      this.recommendations.push({
        id: `rec-fallback-rate-${Date.now()}`,
        type: "monitoring",
        priority: "high",
        title: "Investigate high fallback rate",
        description: `Current fallback rate is ${(stats.fallbackRate * 100).toFixed(1)}%, which is above the acceptable threshold.`,
        action:
          "Review recent incidents and consider implementing additional fallback content or alternative AI providers.",
        impact: "Reduces the frequency of fallback responses and improves user experience.",
        implementationDifficulty: "moderate",
      })
    }

    // Most common trigger recommendation
    const mostCommonTrigger = Object.entries(stats.fallbacksByTrigger).sort((a, b) => b[1] - a[1])[0]

    if (mostCommonTrigger && mostCommonTrigger[1] > 10) {
      // More than 10 occurrences
      const trigger = mostCommonTrigger[0] as FallbackTrigger
      let recommendation: Partial<FallbackRecommendation> = {
        id: `rec-trigger-${trigger}-${Date.now()}`,
        type: "configuration",
        priority: "high",
      }

      switch (trigger) {
        case FallbackTrigger.API_UNAVAILABLE:
          recommendation = {
            ...recommendation,
            title: "Improve API availability",
            description: "Frequent API unavailability is causing fallbacks.",
            action: "Consider implementing a backup AI provider or enhancing the offline content library.",
            impact: "Reduces fallbacks due to API unavailability.",
            implementationDifficulty: "difficult",
          }
          break

        case FallbackTrigger.RATE_LIMITED:
          recommendation = {
            ...recommendation,
            title: "Address rate limiting issues",
            description: "Frequent rate limiting is causing fallbacks.",
            action: "Implement request throttling or consider upgrading your API plan for higher limits.",
            impact: "Reduces fallbacks due to rate limiting.",
            implementationDifficulty: "moderate",
          }
          break

        case FallbackTrigger.CONTEXT_EXCEEDED:
          recommendation = {
            ...recommendation,
            title: "Handle context length better",
            description: "Context length exceeded errors are causing fallbacks.",
            action: "Implement conversation summarization or context pruning to reduce token usage.",
            impact: "Reduces fallbacks due to context length limitations.",
            implementationDifficulty: "moderate",
          }
          break

        case FallbackTrigger.TIMEOUT:
          recommendation = {
            ...recommendation,
            title: "Address timeout issues",
            description: "Frequent timeouts are causing fallbacks.",
            action: "Optimize request handling or consider a faster AI provider.",
            impact: "Reduces fallbacks due to timeouts.",
            implementationDifficulty: "moderate",
          }
          break

        default:
          recommendation = {
            ...recommendation,
            title: `Address ${trigger} issues`,
            description: `Frequent ${trigger} issues are causing fallbacks.`,
            action: "Investigate the root cause and implement appropriate mitigations.",
            impact: `Reduces fallbacks due to ${trigger}.`,
            implementationDifficulty: "moderate",
          }
      }

      this.recommendations.push(recommendation as FallbackRecommendation)
    }

    // Subject-specific recommendation
    const subjectEntries = Object.entries(stats.fallbacksBySubject)
    if (subjectEntries.length > 0) {
      const mostProblematicSubject = subjectEntries.sort((a, b) => b[1] - a[1])[0]
      if (mostProblematicSubject && mostProblematicSubject[1] > 5) {
        // More than 5 occurrences
        const subject = mostProblematicSubject[0]
        this.recommendations.push({
          id: `rec-subject-${subject}-${Date.now()}`,
          type: "content",
          priority: "medium",
          title: `Enhance ${subject} fallback content`,
          description: `The ${subject} subject has a high number of fallbacks.`,
          action: `Add more comprehensive fallback content for ${subject}, especially for common topics.`,
          impact: `Improves fallback quality for ${subject} queries.`,
          implementationDifficulty: "easy",
        })
      }
    }
  }

  // Get fallback statistics
  public getStats(): FallbackStats {
    // Calculate fallback counts by different dimensions
    const fallbacksByTrigger: Record<FallbackTrigger, number> = {} as Record<FallbackTrigger, number>
    const fallbacksByTier: Record<FallbackTier, number> = {} as Record<FallbackTier, number>
    const fallbacksBySeverity: Record<FallbackSeverity, number> = {} as Record<FallbackSeverity, number>
    const fallbacksBySubject: Record<string, number> = {}

    let totalResponseTime = 0
    let responseTimeCount = 0
    let consecutiveMax = 0

    // Initialize counts
    Object.values(FallbackTrigger).forEach((trigger) => {
      fallbacksByTrigger[trigger] = 0
    })

    Object.values(FallbackTier).forEach((tier) => {
      fallbacksByTier[tier] = 0
    })

    Object.values(FallbackSeverity).forEach((severity) => {
      fallbacksBySeverity[severity] = 0
    })

    // Count fallbacks
    for (const fallback of this.fallbackResponses) {
      fallbacksByTrigger[fallback.trigger]++
      fallbacksByTier[fallback.tier]++
      fallbacksBySeverity[fallback.severity]++

      if (fallback.subject) {
        fallbacksBySubject[fallback.subject] = (fallbacksBySubject[fallback.subject] || 0) + 1
      }

      if (fallback.responseTime) {
        totalResponseTime += fallback.responseTime
        responseTimeCount++
      }

      if (fallback.consecutiveCount > consecutiveMax) {
        consecutiveMax = fallback.consecutiveCount
      }
    }

    // Calculate statistics
    const totalFallbacks = this.fallbackResponses.length
    const fallbackRate = this.totalRequests > 0 ? totalFallbacks / this.totalRequests : 0
    const averageResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0
    const lastFallback =
      this.fallbackResponses.length > 0
        ? new Date(this.fallbackResponses[this.fallbackResponses.length - 1].timestamp)
        : null

    // Count active incidents (those with consecutive count > 0)
    const activeIncidents = this.fallbackResponses.filter(
      (f) => f.consecutiveCount > 0 && new Date().getTime() - f.timestamp.getTime() < 3600000,
    ).length // Within the last hour

    return {
      totalFallbacks,
      fallbackRate,
      fallbacksByTrigger,
      fallbacksByTier,
      fallbacksBySeverity,
      fallbacksBySubject,
      averageResponseTime,
      consecutiveMax,
      lastFallback,
      activeIncidents,
    }
  }

  // Get fallback trends
  public getTrends(): { hourly: FallbackTrend; daily: FallbackTrend } {
    const hourlyTrend = this.calculateTrend("hour")
    const dailyTrend = this.calculateTrend("day")

    return {
      hourly: hourlyTrend,
      daily: dailyTrend,
    }
  }

  // Calculate trend for a specific period
  private calculateTrend(period: "hour" | "day"): FallbackTrend {
    const stats = period === "hour" ? this.hourlyStats : this.dailyStats
    const data: { timestamp: Date; count: number; rate: number }[] = []

    // Convert stats to array and sort by timestamp
    for (const [key, stat] of stats.entries()) {
      const parts = key.split("-").map(Number)
      let timestamp: Date

      if (period === "hour") {
        timestamp = new Date(parts[0], parts[1], parts[2], parts[3])
      } else {
        timestamp = new Date(parts[0], parts[1], parts[2])
      }

      data.push({
        timestamp,
        count: stat.fallbacks,
        rate: stat.total > 0 ? stat.fallbacks / stat.total : 0,
      })
    }

    // Sort by timestamp
    data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    // Calculate trend
    let trend: "increasing" | "decreasing" | "stable" = "stable"
    let percentChange = 0

    if (data.length >= 2) {
      // Compare first half with second half
      const midpoint = Math.floor(data.length / 2)
      const firstHalf = data.slice(0, midpoint)
      const secondHalf = data.slice(midpoint)

      const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.rate, 0) / firstHalf.length
      const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.rate, 0) / secondHalf.length

      if (firstHalfAvg === 0) {
        percentChange = secondHalfAvg > 0 ? 100 : 0
      } else {
        percentChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100
      }

      if (percentChange > 10) {
        trend = "increasing"
      } else if (percentChange < -10) {
        trend = "decreasing"
      } else {
        trend = "stable"
      }
    }

    return {
      period,
      data,
      trend,
      percentChange,
    }
  }

  // Get recommendations
  public getRecommendations(): FallbackRecommendation[] {
    return [...this.recommendations].sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }

  // Clear all data (for testing or resets)
  public clearData(): void {
    this.fallbackResponses = []
    this.totalRequests = 0
    this.hourlyStats.clear()
    this.dailyStats.clear()
    this.addDefaultRecommendations()
  }
}
