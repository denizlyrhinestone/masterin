"use client"

// Simple client-side error logger
export const logError = (error: unknown, context?: string) => {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined

  console.error(`[${context || "Client Error"}]`, {
    message: errorMessage,
    stack: errorStack,
    timestamp: new Date().toISOString(),
  })

  // In a production app, you would send this to your error tracking service
  // Example: sendToErrorTrackingService({ message, stack, context })
}

// Initialize error listeners
export const initErrorListeners = () => {
  if (typeof window === "undefined") return

  // Handle uncaught errors
  window.addEventListener("error", (event) => {
    logError(event.error || new Error(event.message), "Uncaught Error")
    // Don't prevent default to allow browser's default error handling
  })

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    logError(event.reason || new Error("Unhandled Promise Rejection"), "Unhandled Rejection")
  })
}
