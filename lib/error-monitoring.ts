import { ErrorCategory, type ErrorSeverity, logError } from "./error-handling"

// Interface for error monitoring configuration
interface ErrorMonitoringConfig {
  enableConsoleLogging: boolean
  enableRemoteLogging: boolean
  errorThresholds: {
    [key in ErrorCategory]: number
  }
  samplingRate: number // 0-1, percentage of errors to log
  groupSimilarErrors: boolean
  retentionPeriod: number // in milliseconds
}

// Default configuration
const DEFAULT_CONFIG: ErrorMonitoringConfig = {
  enableConsoleLogging: true,
  enableRemoteLogging: process.env.NODE_ENV === "production",
  errorThresholds: {
    [ErrorCategory.AUTHENTICATION]: 3,
    [ErrorCategory.AUTHORIZATION]: 3,
    [ErrorCategory.CONNECTIVITY]: 5,
    [ErrorCategory.RATE_LIMIT]: 10,
    [ErrorCategory.TIMEOUT]: 5,
    [ErrorCategory.VALIDATION]: 10,
    [ErrorCategory.MODEL_ERROR]: 5,
    [ErrorCategory.SERVER_ERROR]: 3,
    [ErrorCategory.CLIENT_ERROR]: 10,
    [ErrorCategory.UNKNOWN]: 5,
  },
  samplingRate: 1.0, // Log all errors in development
  groupSimilarErrors: true,
  retentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
}

// Error monitoring service
export class ErrorMonitor {
  private static instance: ErrorMonitor
  private config: ErrorMonitoringConfig
  private errorCounts: Map<ErrorCategory, number> = new Map()
  private errorHistory: Array<{
    timestamp: Date
    category: ErrorCategory
    message: string
    source: string
    severity: ErrorSeverity
  }> = []
  private alertCallbacks: Array<(category: ErrorCategory, count: number) => void> = []

  private constructor(config: Partial<ErrorMonitoringConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }

    // Initialize error counts
    Object.values(ErrorCategory).forEach((category) => {
      this.errorCounts.set(category as ErrorCategory, 0)
    })
  }

  // Singleton pattern
  public static getInstance(config: Partial<ErrorMonitoringConfig> = {}): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor(config)
    }
    return ErrorMonitor.instance
  }

  // Track an error
  public trackError(
    error: Error | string,
    source: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    metadata: Record<string, any> = {},
  ): void {
    // Sample errors based on configuration
    if (Math.random() > this.config.samplingRate) {
      return
    }

    // Log the error
    if (this.config.enableConsoleLogging) {
      logError(error, source, metadata)
    }

    // Track error count by category
    const currentCount = this.errorCounts.get(category) || 0
    this.errorCounts.set(category, currentCount + 1)

    // Add to history
    this.errorHistory.push({
      timestamp: new Date(),
      category,
      message: typeof error === "string" ? error : error.message,
      source,
      severity,
    })

    // Check if we've exceeded the threshold for this category
    const threshold = this.config.errorThresholds[category]
    if (currentCount + 1 >= threshold) {
      this.triggerAlert(category, currentCount + 1)
    }

    // Prune old errors
    this.pruneErrorHistory()
  }

  // Register an alert callback
  public registerAlertCallback(callback: (category: ErrorCategory, count: number) => void): void {
    this.alertCallbacks.push(callback)
  }

  // Trigger alerts when thresholds are exceeded
  private triggerAlert(category: ErrorCategory, count: number): void {
    for (const callback of this.alertCallbacks) {
      try {
        callback(category, count)
      } catch (e) {
        console.error("Error in alert callback:", e)
      }
    }
  }

  // Prune error history based on retention period
  private pruneErrorHistory(): void {
    const cutoffTime = new Date(Date.now() - this.config.retentionPeriod)
    this.errorHistory = this.errorHistory.filter((entry) => entry.timestamp > cutoffTime)
  }

  // Get error statistics
  public getErrorStats(): {
    counts: Record<ErrorCategory, number>
    recentErrors: Array<{
      timestamp: Date
      category: ErrorCategory
      message: string
      source: string
      severity: ErrorSeverity
    }>
    totalErrors: number
  } {
    return {
      counts: Object.fromEntries(this.errorCounts) as Record<ErrorCategory, number>,
      recentErrors: [...this.errorHistory].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10),
      totalErrors: [...this.errorCounts.values()].reduce((sum, count) => sum + count, 0),
    }
  }

  // Reset error counts
  public resetCounts(): void {
    Object.values(ErrorCategory).forEach((category) => {
      this.errorCounts.set(category as ErrorCategory, 0)
    })
  }
}

// Initialize the error monitor
export const errorMonitor = ErrorMonitor.getInstance()
