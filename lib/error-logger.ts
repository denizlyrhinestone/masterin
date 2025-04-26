// Error logging utility

type ErrorSeverity = "low" | "medium" | "high" | "critical"

interface ErrorLogOptions {
  severity?: ErrorSeverity
  context?: Record<string, any>
  userId?: string
  tags?: string[]
}

/**
 * Logs errors with additional context for debugging
 */
export function logError(error: Error, options: ErrorLogOptions = {}) {
  const { severity = "medium", context = {}, userId, tags = [] } = options

  // Prepare error data
  const errorData = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString(),
    severity,
    context,
    userId,
    tags,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
  }

  // Log to console in development
  console.error("Application error:", errorData)

  // In production, you would send this to your error tracking service
  if (process.env.NODE_ENV === "production") {
    // Example: send to error tracking service
    // sendToErrorTrackingService(errorData);
  }

  return errorData
}

/**
 * Creates a wrapped version of a function that catches and logs errors
 */
export function withErrorLogging<T extends (...args: any[]) => any>(
  fn: T,
  options: ErrorLogOptions = {},
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    try {
      return fn(...args)
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), options)
      throw error
    }
  }
}

/**
 * Async version of withErrorLogging
 */
export function withAsyncErrorLogging<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: ErrorLogOptions = {},
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    try {
      return await fn(...args)
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), options)
      throw error
    }
  }
}
