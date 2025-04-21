import { logError } from "./error-handling"

// Health status types
export enum HealthStatus {
  OPERATIONAL = "operational",
  DEGRADED = "degraded",
  OUTAGE = "outage",
  MAINTENANCE = "maintenance",
  UNKNOWN = "unknown",
}

// Service types that we monitor
export enum ServiceType {
  AI_MODEL = "ai_model",
  DATABASE = "database",
  AUTHENTICATION = "authentication",
  STORAGE = "storage",
  API = "api",
  FRONTEND = "frontend",
}

// Interface for service health check results
export interface ServiceHealth {
  service: ServiceType | string
  status: HealthStatus
  latency?: number
  lastChecked: string
  message?: string
  metadata?: Record<string, any>
}

// Interface for overall system health
export interface SystemHealth {
  status: HealthStatus
  services: Record<string, ServiceHealth>
  lastUpdated: string
  incidents: HealthIncident[]
}

// Interface for health incidents
export interface HealthIncident {
  id: string
  service: ServiceType | string
  status: HealthStatus
  message: string
  startTime: string
  endTime?: string
  updates: HealthIncidentUpdate[]
}

// Interface for incident updates
export interface HealthIncidentUpdate {
  timestamp: string
  message: string
  status: HealthStatus
}

// Class to manage service health monitoring
export class HealthMonitor {
  private static instance: HealthMonitor
  private systemHealth: SystemHealth
  private checkIntervals: Record<string, NodeJS.Timeout> = {}
  private alertCallbacks: ((incident: HealthIncident) => void)[] = []

  private constructor() {
    this.systemHealth = {
      status: HealthStatus.UNKNOWN,
      services: {},
      lastUpdated: new Date().toISOString(),
      incidents: [],
    }
  }

  // Singleton pattern
  public static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor()
    }
    return HealthMonitor.instance
  }

  // Register a health check for a service
  public registerHealthCheck(
    service: ServiceType | string,
    checkFn: () => Promise<ServiceHealth>,
    intervalMs = 60000, // Default to 1 minute
  ): void {
    // Clear any existing interval
    if (this.checkIntervals[service]) {
      clearInterval(this.checkIntervals[service])
    }

    // Set up the interval
    this.checkIntervals[service] = setInterval(async () => {
      try {
        const health = await checkFn()
        this.updateServiceHealth(service, health)
      } catch (error) {
        logError(error instanceof Error ? error : String(error), `HealthMonitor.${service}`, { service })

        // If the health check itself fails, mark the service as unknown
        this.updateServiceHealth(service, {
          service,
          status: HealthStatus.UNKNOWN,
          lastChecked: new Date().toISOString(),
          message: `Health check failed: ${error instanceof Error ? error.message : String(error)}`,
        })
      }
    }, intervalMs)

    // Run the check immediately
    checkFn()
      .then((health) => {
        this.updateServiceHealth(service, health)
      })
      .catch((error) => {
        logError(error instanceof Error ? error : String(error), `HealthMonitor.${service}`, { service })
      })
  }

  // Update the health status of a service
  private updateServiceHealth(service: ServiceType | string, health: ServiceHealth): void {
    const previousStatus = this.systemHealth.services[service]?.status

    // Update the service health
    this.systemHealth.services[service] = health
    this.systemHealth.lastUpdated = new Date().toISOString()

    // Recalculate overall system health
    this.recalculateSystemHealth()

    // Check if we need to create or update an incident
    if (health.status !== HealthStatus.OPERATIONAL && health.status !== previousStatus) {
      this.createOrUpdateIncident(service, health)
    } else if (
      health.status === HealthStatus.OPERATIONAL &&
      previousStatus &&
      previousStatus !== HealthStatus.OPERATIONAL
    ) {
      this.resolveIncident(service, health)
    }
  }

  // Recalculate the overall system health based on service statuses
  private recalculateSystemHealth(): void {
    const services = Object.values(this.systemHealth.services)

    if (services.length === 0) {
      this.systemHealth.status = HealthStatus.UNKNOWN
      return
    }

    if (services.some((s) => s.status === HealthStatus.OUTAGE)) {
      this.systemHealth.status = HealthStatus.OUTAGE
    } else if (services.some((s) => s.status === HealthStatus.DEGRADED)) {
      this.systemHealth.status = HealthStatus.DEGRADED
    } else if (services.some((s) => s.status === HealthStatus.MAINTENANCE)) {
      this.systemHealth.status = HealthStatus.MAINTENANCE
    } else if (services.every((s) => s.status === HealthStatus.OPERATIONAL)) {
      this.systemHealth.status = HealthStatus.OPERATIONAL
    } else {
      this.systemHealth.status = HealthStatus.UNKNOWN
    }
  }

  // Create or update a health incident
  private createOrUpdateIncident(service: ServiceType | string, health: ServiceHealth): void {
    // Look for an existing unresolved incident for this service
    const existingIncident = this.systemHealth.incidents.find((i) => i.service === service && !i.endTime)

    if (existingIncident) {
      // Update the existing incident
      existingIncident.status = health.status
      existingIncident.updates.push({
        timestamp: new Date().toISOString(),
        message: health.message || `Service status changed to ${health.status}`,
        status: health.status,
      })

      // Trigger alerts
      this.triggerAlerts(existingIncident)
    } else {
      // Create a new incident
      const newIncident: HealthIncident = {
        id: `incident-${Date.now()}`,
        service,
        status: health.status,
        message: health.message || `Service is ${health.status}`,
        startTime: new Date().toISOString(),
        updates: [
          {
            timestamp: new Date().toISOString(),
            message: health.message || `Service status changed to ${health.status}`,
            status: health.status,
          },
        ],
      }

      this.systemHealth.incidents.push(newIncident)

      // Trigger alerts
      this.triggerAlerts(newIncident)
    }
  }

  // Resolve an incident
  private resolveIncident(service: ServiceType | string, health: ServiceHealth): void {
    // Find the unresolved incident for this service
    const incident = this.systemHealth.incidents.find((i) => i.service === service && !i.endTime)

    if (incident) {
      incident.status = HealthStatus.OPERATIONAL
      incident.endTime = new Date().toISOString()
      incident.updates.push({
        timestamp: new Date().toISOString(),
        message: health.message || "Service has recovered and is operational",
        status: HealthStatus.OPERATIONAL,
      })

      // Trigger resolution alert
      this.triggerAlerts(incident)
    }
  }

  // Register an alert callback
  public registerAlertCallback(callback: (incident: HealthIncident) => void): void {
    this.alertCallbacks.push(callback)
  }

  // Trigger alerts for an incident
  private triggerAlerts(incident: HealthIncident): void {
    for (const callback of this.alertCallbacks) {
      try {
        callback(incident)
      } catch (error) {
        logError(error instanceof Error ? error : String(error), "HealthMonitor.triggerAlerts", { incident })
      }
    }
  }

  // Get the current system health
  public getSystemHealth(): SystemHealth {
    return { ...this.systemHealth }
  }

  // Get the health of a specific service
  public getServiceHealth(service: ServiceType | string): ServiceHealth | undefined {
    return this.systemHealth.services[service]
  }

  // Get active incidents
  public getActiveIncidents(): HealthIncident[] {
    return this.systemHealth.incidents.filter((i) => !i.endTime)
  }

  // Get all incidents
  public getAllIncidents(): HealthIncident[] {
    return [...this.systemHealth.incidents]
  }

  // Clean up intervals on shutdown
  public shutdown(): void {
    for (const interval of Object.values(this.checkIntervals)) {
      clearInterval(interval)
    }
  }
}

// Helper function to create a health check function for an AI model
export function createAIModelHealthCheck(
  modelName: string,
  checkFn: () => Promise<boolean>,
  timeoutMs = 5000,
): () => Promise<ServiceHealth> {
  return async () => {
    const startTime = Date.now()

    try {
      // Set up a timeout
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error(`Health check timed out after ${timeoutMs}ms`)), timeoutMs)
      })

      // Race the check function against the timeout
      const isHealthy = await Promise.race([checkFn(), timeoutPromise])
      const latency = Date.now() - startTime

      if (isHealthy) {
        return {
          service: `${ServiceType.AI_MODEL}.${modelName}`,
          status: HealthStatus.OPERATIONAL,
          latency,
          lastChecked: new Date().toISOString(),
          message: `${modelName} is operational`,
        }
      } else {
        return {
          service: `${ServiceType.AI_MODEL}.${modelName}`,
          status: HealthStatus.DEGRADED,
          latency,
          lastChecked: new Date().toISOString(),
          message: `${modelName} is responding but may have issues`,
        }
      }
    } catch (error) {
      const latency = Date.now() - startTime

      // Log the error
      logError(error instanceof Error ? error : String(error), `HealthCheck.${modelName}`, { modelName, latency })

      // Determine if this is a timeout or another error
      const isTimeout = error instanceof Error && error.message.includes("timed out")

      return {
        service: `${ServiceType.AI_MODEL}.${modelName}`,
        status: isTimeout ? HealthStatus.DEGRADED : HealthStatus.OUTAGE,
        latency,
        lastChecked: new Date().toISOString(),
        message: isTimeout
          ? `${modelName} health check timed out`
          : `${modelName} is experiencing issues: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }
}
