import { type ErrorCategory, ErrorCodes, logError } from "./error-handling"

// Fallback trigger types - specific reasons why a fallback occurred
export enum FallbackTrigger {
  API_UNAVAILABLE = "api_unavailable",
  MODEL_OVERLOADED = "model_overloaded",
  RATE_LIMITED = "rate_limited",
  CONTEXT_EXCEEDED = "context_exceeded",
  CONTENT_FILTERED = "content_filtered",
  MALFORMED_RESPONSE = "malformed_response",
  TIMEOUT = "timeout",
  LOW_CONFIDENCE = "low_confidence",
  AUTHENTICATION_FAILURE = "authentication_failure",
  UNKNOWN = "unknown",
}

// Fallback severity levels
export enum FallbackSeverity {
  MINOR = "minor", // Single occurrence, likely temporary
  MODERATE = "moderate", // Multiple occurrences, potential issue
  MAJOR = "major", // Consistent issue affecting user experience
  CRITICAL = "critical", // Complete service disruption
}

// Interface for fallback incident tracking
export interface FallbackIncident {
  id: string
  trigger: FallbackTrigger
  severity: FallbackSeverity
  errorCode?: string
  errorCategory?: ErrorCategory
  timestamp: string
  message: string
  subject?: string
  topic?: string
  query?: string
  responseTime?: number
  consecutiveCount: number
  resolved: boolean
  resolvedAt?: string
  resolution?: string
}

// Fallback analyzer class
export class FallbackAnalyzer {
  private static instance: FallbackAnalyzer
  private incidents: FallbackIncident[] = []
  private activeIncidents: Map<string, FallbackIncident> = new Map()
  private triggerCounts: Map<FallbackTrigger, number> = new Map()
  private subjectTriggerCounts: Map<string, Map<FallbackTrigger, number>> = new Map()
  private listeners: ((incident: FallbackIncident) => void)[] = []

  private constructor() {
    // Initialize trigger counts
    Object.values(FallbackTrigger).forEach((trigger) => {
      this.triggerCounts.set(trigger as FallbackTrigger, 0)
    })
  }

  // Singleton pattern
  public static getInstance(): FallbackAnalyzer {
    if (!FallbackAnalyzer.instance) {
      FallbackAnalyzer.instance = new FallbackAnalyzer()
    }
    return FallbackAnalyzer.instance
  }

  // Analyze an error to determine the fallback trigger
  public analyzeFallback(
    error: Error | string,
    errorCode?: string,
    errorCategory?: ErrorCategory,
    metadata: Record<string, any> = {},
  ): FallbackTrigger {
    const message = typeof error === "string" ? error : error.message
    const lowerMessage = message.toLowerCase()

    // Determine the fallback trigger based on error message and code
    if (errorCode) {
      switch (errorCode) {
        case ErrorCodes.CONN_NETWORK_FAILURE:
        case ErrorCodes.CONN_SERVICE_UNAVAILABLE:
          return FallbackTrigger.API_UNAVAILABLE

        case ErrorCodes.RATE_TOO_MANY_REQUESTS:
        case ErrorCodes.RATE_QUOTA_EXCEEDED:
          return FallbackTrigger.RATE_LIMITED

        case ErrorCodes.MODEL_CONTEXT_LENGTH_EXCEEDED:
          return FallbackTrigger.CONTEXT_EXCEEDED

        case ErrorCodes.MODEL_CONTENT_FILTERED:
          return FallbackTrigger.CONTENT_FILTERED

        case ErrorCodes.MODEL_INVALID_RESPONSE:
          return FallbackTrigger.MALFORMED_RESPONSE

        case ErrorCodes.CONN_TIMEOUT:
          return FallbackTrigger.TIMEOUT

        case ErrorCodes.AUTH_INVALID_KEY:
        case ErrorCodes.AUTH_EXPIRED_KEY:
        case ErrorCodes.AUTH_INSUFFICIENT_PERMISSIONS:
          return FallbackTrigger.AUTHENTICATION_FAILURE
      }
    }

    // If no error code or not matched above, analyze the message
    if (
      lowerMessage.includes("unavailable") ||
      lowerMessage.includes("cannot connect") ||
      lowerMessage.includes("network") ||
      lowerMessage.includes("offline")
    ) {
      return FallbackTrigger.API_UNAVAILABLE
    }

    if (
      lowerMessage.includes("rate limit") ||
      lowerMessage.includes("too many requests") ||
      lowerMessage.includes("quota")
    ) {
      return FallbackTrigger.RATE_LIMITED
    }

    if (lowerMessage.includes("context") || lowerMessage.includes("token limit") || lowerMessage.includes("too long")) {
      return FallbackTrigger.CONTEXT_EXCEEDED
    }

    if (lowerMessage.includes("content") || lowerMessage.includes("policy") || lowerMessage.includes("filtered")) {
      return FallbackTrigger.CONTENT_FILTERED
    }

    if (lowerMessage.includes("malformed") || lowerMessage.includes("invalid response")) {
      return FallbackTrigger.MALFORMED_RESPONSE
    }

    if (lowerMessage.includes("timeout") || lowerMessage.includes("timed out")) {
      return FallbackTrigger.TIMEOUT
    }

    if (
      lowerMessage.includes("confidence") ||
      lowerMessage.includes("uncertain") ||
      lowerMessage.includes("not sure")
    ) {
      return FallbackTrigger.LOW_CONFIDENCE
    }

    if (
      lowerMessage.includes("auth") ||
      lowerMessage.includes("key") ||
      lowerMessage.includes("credential") ||
      lowerMessage.includes("permission")
    ) {
      return FallbackTrigger.AUTHENTICATION_FAILURE
    }

    if (lowerMessage.includes("overloaded") || lowerMessage.includes("capacity") || lowerMessage.includes("busy")) {
      return FallbackTrigger.MODEL_OVERLOADED
    }

    return FallbackTrigger.UNKNOWN
  }

  // Determine fallback severity based on trigger and frequency
  public determineSeverity(trigger: FallbackTrigger, consecutiveCount: number): FallbackSeverity {
    // Authentication and API unavailability are always higher severity
    if (trigger === FallbackTrigger.AUTHENTICATION_FAILURE || trigger === FallbackTrigger.API_UNAVAILABLE) {
      return consecutiveCount > 1 ? FallbackSeverity.CRITICAL : FallbackSeverity.MAJOR
    }

    // Rate limiting and timeouts can be moderate to major
    if (trigger === FallbackTrigger.RATE_LIMITED || trigger === FallbackTrigger.TIMEOUT) {
      if (consecutiveCount > 5) return FallbackSeverity.CRITICAL
      if (consecutiveCount > 2) return FallbackSeverity.MAJOR
      return FallbackSeverity.MODERATE
    }

    // Context exceeded and content filtered are usually minor to moderate
    if (trigger === FallbackTrigger.CONTEXT_EXCEEDED || trigger === FallbackTrigger.CONTENT_FILTERED) {
      if (consecutiveCount > 3) return FallbackSeverity.MAJOR
      if (consecutiveCount > 1) return FallbackSeverity.MODERATE
      return FallbackSeverity.MINOR
    }

    // Default severity based on consecutive count
    if (consecutiveCount > 10) return FallbackSeverity.CRITICAL
    if (consecutiveCount > 5) return FallbackSeverity.MAJOR
    if (consecutiveCount > 2) return FallbackSeverity.MODERATE
    return FallbackSeverity.MINOR
  }

  // Record a fallback incident
  public recordFallback(
    trigger: FallbackTrigger,
    message: string,
    metadata: {
      errorCode?: string
      errorCategory?: ErrorCategory
      subject?: string
      topic?: string
      query?: string
      responseTime?: number
      sessionId?: string
      userId?: string
    } = {},
  ): FallbackIncident {
    // Increment trigger count
    this.triggerCounts.set(trigger, (this.triggerCounts.get(trigger) || 0) + 1)

    // Increment subject-specific trigger count
    if (metadata.subject) {
      if (!this.subjectTriggerCounts.has(metadata.subject)) {
        this.subjectTriggerCounts.set(metadata.subject, new Map())
      }
      const subjectCounts = this.subjectTriggerCounts.get(metadata.subject)!
      subjectCounts.set(trigger, (subjectCounts.get(trigger) || 0) + 1)
    }

    // Check if there's an active incident for this trigger
    const key = this.getIncidentKey(trigger, metadata.subject)
    let incident: FallbackIncident

    if (this.activeIncidents.has(key)) {
      // Update existing incident
      incident = this.activeIncidents.get(key)!
      incident.consecutiveCount++
      incident.timestamp = new Date().toISOString()
      incident.message = message
      incident.severity = this.determineSeverity(trigger, incident.consecutiveCount)

      // Update with latest metadata
      if (metadata.errorCode) incident.errorCode = metadata.errorCode
      if (metadata.errorCategory) incident.errorCategory = metadata.errorCategory
      if (metadata.responseTime) incident.responseTime = metadata.responseTime
      if (metadata.query) incident.query = metadata.query
    } else {
      // Create new incident
      incident = {
        id: `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        trigger,
        severity: this.determineSeverity(trigger, 1),
        timestamp: new Date().toISOString(),
        message,
        consecutiveCount: 1,
        resolved: false,
        ...metadata,
      }
      this.activeIncidents.set(key, incident)
    }

    // Add to incidents list
    this.incidents.push({ ...incident })

    // Log the fallback incident
    logError(
      message,
      "FallbackAnalyzer.recordFallback",
      {
        trigger,
        severity: incident.severity,
        consecutiveCount: incident.consecutiveCount,
        subject: metadata.subject,
        topic: metadata.topic,
      },
      metadata.userId,
      metadata.sessionId,
    )

    // Notify listeners
    this.notifyListeners(incident)

    return incident
  }

  // Resolve a fallback incident
  public resolveFallback(trigger: FallbackTrigger, subject?: string, resolution?: string): FallbackIncident | null {
    const key = this.getIncidentKey(trigger, subject)

    if (this.activeIncidents.has(key)) {
      const incident = this.activeIncidents.get(key)!
      incident.resolved = true
      incident.resolvedAt = new Date().toISOString()
      if (resolution) incident.resolution = resolution

      // Remove from active incidents
      this.activeIncidents.delete(key)

      // Add resolved incident to the list
      this.incidents.push({ ...incident })

      // Notify listeners
      this.notifyListeners(incident)

      return incident
    }

    return null
  }

  // Get a key for the incident map
  private getIncidentKey(trigger: FallbackTrigger, subject?: string): string {
    return `${trigger}${subject ? `-${subject}` : ""}`
  }

  // Register a listener for fallback incidents
  public registerListener(listener: (incident: FallbackIncident) => void): void {
    this.listeners.push(listener)
  }

  // Notify all listeners of a fallback incident
  private notifyListeners(incident: FallbackIncident): void {
    for (const listener of this.listeners) {
      try {
        listener(incident)
      } catch (error) {
        console.error("Error in fallback incident listener:", error)
      }
    }
  }

  // Get all fallback incidents
  public getAllIncidents(): FallbackIncident[] {
    return [...this.incidents]
  }

  // Get active fallback incidents
  public getActiveIncidents(): FallbackIncident[] {
    return Array.from(this.activeIncidents.values())
  }

  // Get fallback trigger counts
  public getTriggerCounts(): Map<FallbackTrigger, number> {
    return new Map(this.triggerCounts)
  }

  // Get subject-specific fallback trigger counts
  public getSubjectTriggerCounts(subject: string): Map<FallbackTrigger, number> {
    return new Map(this.subjectTriggerCounts.get(subject) || new Map())
  }

  // Get the most common fallback trigger
  public getMostCommonTrigger(): { trigger: FallbackTrigger; count: number } | null {
    if (this.triggerCounts.size === 0) return null

    let maxTrigger: FallbackTrigger = FallbackTrigger.UNKNOWN
    let maxCount = 0

    for (const [trigger, count] of this.triggerCounts.entries()) {
      if (count > maxCount) {
        maxTrigger = trigger
        maxCount = count
      }
    }

    return { trigger: maxTrigger, count: maxCount }
  }

  // Get the most common fallback trigger for a specific subject
  public getMostCommonTriggerForSubject(subject: string): { trigger: FallbackTrigger; count: number } | null {
    const subjectCounts = this.subjectTriggerCounts.get(subject)
    if (!subjectCounts || subjectCounts.size === 0) return null

    let maxTrigger: FallbackTrigger = FallbackTrigger.UNKNOWN
    let maxCount = 0

    for (const [trigger, count] of subjectCounts.entries()) {
      if (count > maxCount) {
        maxTrigger = trigger
        maxCount = count
      }
    }

    return { trigger: maxTrigger, count: maxCount }
  }

  // Clear all fallback data (for testing or resets)
  public clearData(): void {
    this.incidents = []
    this.activeIncidents.clear()
    this.triggerCounts.clear()
    this.subjectTriggerCounts.clear()

    // Reinitialize trigger counts
    Object.values(FallbackTrigger).forEach((trigger) => {
      this.triggerCounts.set(trigger as FallbackTrigger, 0)
    })
  }
}
