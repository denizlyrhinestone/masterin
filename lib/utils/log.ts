/**
 * Log levels for application logging
 */
export type LogSeverity = "debug" | "info" | "warning" | "medium" | "high" | "critical"

/**
 * Log context information
 */
export interface LogContext {
  userId?: string
  sessionId?: string
  requestId?: string
  path?: string
  tags?: string[]
  severity?: LogSeverity
  context?: Record<string, any>
}

/**
 * Logs an error with contextual information
 * @param error The error to log
 * @param context Additional context information
 */
export function logError(error: Error, context: LogContext = {}): void {
  const { severity = "medium", tags = [], ...otherContext } = context

  // Create a structured log entry
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: severity,
    message: error.message,
    stack: error.stack,
    tags: ["error", ...tags],
    ...otherContext,
  }

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("ERROR:", logEntry)
  } else {
    // In production, we'd typically send this to a logging service
    // For now, we'll just use console.error with a more compact format
    console.error(`[${logEntry.timestamp}] [${severity.toUpperCase()}] ${error.message}`, {
      tags,
      ...otherContext,
      stack: error.stack,
    })
  }

  // Here you would typically send the log to your logging service
  // Example: await sendToLoggingService(logEntry);
}

/**
 * Logs an informational message
 * @param message The message to log
 * @param context Additional context information
 */
export function logInfo(message: string, context: Omit<LogContext, "severity"> = {}): void {
  const { tags = [], ...otherContext } = context

  const logEntry = {
    timestamp: new Date().toISOString(),
    level: "info",
    message,
    tags: ["info", ...tags],
    ...otherContext,
  }

  if (process.env.NODE_ENV === "development") {
    console.log("INFO:", logEntry)
  } else {
    console.log(`[${logEntry.timestamp}] [INFO] ${message}`)
  }
}

/**
 * Logs a warning message
 * @param message The warning message to log
 * @param context Additional context information
 */
export function logWarning(message: string, context: Omit<LogContext, "severity"> = {}): void {
  const { tags = [], ...otherContext } = context

  const logEntry = {
    timestamp: new Date().toISOString(),
    level: "warning",
    message,
    tags: ["warning", ...tags],
    ...otherContext,
  }

  if (process.env.NODE_ENV === "development") {
    console.warn("WARNING:", logEntry)
  } else {
    console.warn(`[${logEntry.timestamp}] [WARNING] ${message}`)
  }
}
