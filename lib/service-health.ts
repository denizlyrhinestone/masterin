import { errorMonitor } from "./error-monitoring"
import { ErrorCategory, ErrorSeverity } from "./error-handling"

// Service health status
export enum ServiceStatus {
  OPERATIONAL = "operational",
  DEGRADED = "degraded",
  OUTAGE = "outage",
  UNKNOWN = "unknown",
}

// Service types
export enum ServiceType {
  OPENAI = "openai",
  GROQ = "groq",
  XAI = "xai",
  DATABASE = "database",
  STORAGE = "storage",
  AUTHENTICATION = "authentication",
}

// Service health interface
export interface ServiceHealth {
  type: ServiceType
  status: ServiceStatus
  lastChecked: Date
  responseTime?: number
  errorCount: number
  consecutiveErrors: number
  message?: string
}

// Service health monitor
export class ServiceHealthMonitor {
  private static instance: ServiceHealthMonitor
  private services: Map<ServiceType, ServiceHealth> = new Map()
  private checkIntervals: Map<ServiceType, NodeJS.Timeout> = new Map()
  private statusChangeCallbacks: Array<
    (service: ServiceType, oldStatus: ServiceStatus, newStatus: ServiceStatus) => void
  > = []

  private constructor() {
    // Initialize service health
    Object.values(ServiceType).forEach((type) => {
      this.services.set(type as ServiceType, {
        type: type as ServiceType,
        status: ServiceStatus.UNKNOWN,
        lastChecked: new Date(0), // Unix epoch
        errorCount: 0,
        consecutiveErrors: 0,
      })
    })
  }

  // Singleton pattern
  public static getInstance(): ServiceHealthMonitor {
    if (!ServiceHealthMonitor.instance) {
      ServiceHealthMonitor.instance = new ServiceHealthMonitor()
    }
    return ServiceHealthMonitor.instance
  }

  // Update service health
  public updateServiceHealth(type: ServiceType, status: ServiceStatus, responseTime?: number, message?: string): void {
    const service = this.services.get(type)

    if (!service) {
      return
    }

    const oldStatus = service.status

    // Update service health
    service.status = status
    service.lastChecked = new Date()
    if (responseTime !== undefined) {
      service.responseTime = responseTime
    }
    if (message) {
      service.message = message
    }

    // Update error counts
    if (status === ServiceStatus.OPERATIONAL) {
      service.consecutiveErrors = 0
    } else {
      service.errorCount++
      service.consecutiveErrors++

      // Log to error monitor if service is degraded or down
      if (status === ServiceStatus.DEGRADED || status === ServiceStatus.OUTAGE) {
        errorMonitor.trackError(
          message || `Service ${type} is ${status}`,
          "ServiceHealthMonitor",
          ErrorCategory.CONNECTIVITY,
          status === ServiceStatus.OUTAGE ? ErrorSeverity.ERROR : ErrorSeverity.WARNING,
          { serviceType: type, responseTime },
        )
      }
    }

    // Notify callbacks if status changed
    if (oldStatus !== status) {
      this.notifyStatusChange(type, oldStatus, status)
    }
  }

  // Register a status change callback
  public registerStatusChangeCallback(
    callback: (service: ServiceType, oldStatus: ServiceStatus, newStatus: ServiceStatus) => void,
  ): void {
    this.statusChangeCallbacks.push(callback)
  }

  // Notify status change callbacks
  private notifyStatusChange(service: ServiceType, oldStatus: ServiceStatus, newStatus: ServiceStatus): void {
    for (const callback of this.statusChangeCallbacks) {
      try {
        callback(service, oldStatus, newStatus)
      } catch (e) {
        console.error("Error in status change callback:", e)
      }
    }
  }

  // Schedule regular health checks
  public scheduleHealthCheck(
    type: ServiceType,
    checkFn: () => Promise<{ status: ServiceStatus; responseTime?: number; message?: string }>,
    intervalMs = 60000, // Default: check every minute
  ): void {
    // Clear any existing interval
    if (this.checkIntervals.has(type)) {
      clearInterval(this.checkIntervals.get(type))
    }

    // Schedule new interval
    const interval = setInterval(async () => {
      try {
        const result = await checkFn()
        this.updateServiceHealth(type, result.status, result.responseTime, result.message)
      } catch (error) {
        this.updateServiceHealth(
          type,
          ServiceStatus.OUTAGE,
          undefined,
          error instanceof Error ? error.message : String(error),
        )
      }
    }, intervalMs)

    this.checkIntervals.set(type, interval)

    // Run an immediate check
    checkFn()
      .then((result) => {
        this.updateServiceHealth(type, result.status, result.responseTime, result.message)
      })
      .catch((error) => {
        this.updateServiceHealth(
          type,
          ServiceStatus.OUTAGE,
          undefined,
          error instanceof Error ? error.message : String(error),
        )
      })
  }

  // Get service health
  public getServiceHealth(type: ServiceType): ServiceHealth | undefined {
    return this.services.get(type)
  }

  // Get all service health
  public getAllServiceHealth(): Map<ServiceType, ServiceHealth> {
    return new Map(this.services)
  }

  // Check if a service is available
  public isServiceAvailable(type: ServiceType): boolean {
    const service = this.services.get(type)
    return service ? service.status === ServiceStatus.OPERATIONAL : false
  }

  // Check if a service is degraded
  public isServiceDegraded(type: ServiceType): boolean {
    const service = this.services.get(type)
    return service ? service.status === ServiceStatus.DEGRADED : false
  }

  // Clean up intervals
  public cleanup(): void {
    for (const interval of this.checkIntervals.values()) {
      clearInterval(interval)
    }
    this.checkIntervals.clear()
  }
}

// Initialize the service health monitor
export const serviceHealthMonitor = ServiceHealthMonitor.getInstance()
