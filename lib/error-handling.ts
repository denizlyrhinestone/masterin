import { toast } from "@/hooks/use-toast"

// Error severity levels
export enum ErrorSeverity {
  DEBUG = "debug",
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

// Error categories for better classification
export enum ErrorCategory {
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  CONNECTIVITY = "connectivity",
  RATE_LIMIT = "rate_limit",
  TIMEOUT = "timeout",
  VALIDATION = "validation",
  MODEL_ERROR = "model_error",
  SERVER_ERROR = "server_error",
  CLIENT_ERROR = "client_error",
  UNKNOWN = "unknown",
}

// Interface for structured error logging
export interface ErrorLog {
  timestamp: string
  message: string
  severity: ErrorSeverity
  category: ErrorCategory
  source: string
  userId?: string
  sessionId?: string
  requestId?: string
  errorCode?: string
  stackTrace?: string
  metadata?: Record<string, any>
}

// Error codes with descriptions for consistent error reporting
export const ErrorCodes = {
  // Authentication errors
  AUTH_INVALID_KEY: "AUTH_INVALID_KEY",
  AUTH_EXPIRED_KEY: "AUTH_EXPIRED_KEY",
  AUTH_INSUFFICIENT_PERMISSIONS: "AUTH_INSUFFICIENT_PERMISSIONS",

  // Connectivity errors
  CONN_NETWORK_FAILURE: "CONN_NETWORK_FAILURE",
  CONN_TIMEOUT: "CONN_TIMEOUT",
  CONN_SERVICE_UNAVAILABLE: "CONN_SERVICE_UNAVAILABLE",

  // Rate limiting
  RATE_TOO_MANY_REQUESTS: "RATE_TOO_MANY_REQUESTS",
  RATE_QUOTA_EXCEEDED: "RATE_QUOTA_EXCEEDED",

  // Model errors
  MODEL_CONTEXT_LENGTH_EXCEEDED: "MODEL_CONTEXT_LENGTH_EXCEEDED",
  MODEL_CONTENT_FILTERED: "MODEL_CONTENT_FILTERED",
  MODEL_INVALID_RESPONSE: "MODEL_INVALID_RESPONSE",

  // Server errors
  SERVER_INTERNAL_ERROR: "SERVER_INTERNAL_ERROR",
  SERVER_DEPENDENCY_FAILURE: "SERVER_DEPENDENCY_FAILURE",

  // Client errors
  CLIENT_INVALID_INPUT: "CLIENT_INVALID_INPUT",
  CLIENT_UNSUPPORTED_OPERATION: "CLIENT_UNSUPPORTED_OPERATION",

  // Unknown
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
}

// Map of error codes to user-friendly messages
export const ErrorMessages: Record<string, string> = {
  [ErrorCodes.AUTH_INVALID_KEY]: "Invalid API key. Please check your configuration.",
  [ErrorCodes.AUTH_EXPIRED_KEY]: "Your API key has expired. Please renew it.",
  [ErrorCodes.AUTH_INSUFFICIENT_PERMISSIONS]: "Insufficient permissions for this operation.",

  [ErrorCodes.CONN_NETWORK_FAILURE]: "Network connection failed. Please check your internet connection.",
  [ErrorCodes.CONN_TIMEOUT]: "Request timed out. The service might be experiencing high load.",
  [ErrorCodes.CONN_SERVICE_UNAVAILABLE]: "The AI service is currently unavailable. Please try again later.",

  [ErrorCodes.RATE_TOO_MANY_REQUESTS]: "Too many requests. Please slow down and try again in a moment.",
  [ErrorCodes.RATE_QUOTA_EXCEEDED]: "Your usage quota has been exceeded for this period.",

  [ErrorCodes.MODEL_CONTEXT_LENGTH_EXCEEDED]: "The conversation is too long for the AI model to process.",
  [ErrorCodes.MODEL_CONTENT_FILTERED]: "Your request was filtered due to content policy restrictions.",
  [ErrorCodes.MODEL_INVALID_RESPONSE]: "The AI model returned an invalid response.",

  [ErrorCodes.SERVER_INTERNAL_ERROR]: "An internal server error occurred. Our team has been notified.",
  [ErrorCodes.SERVER_DEPENDENCY_FAILURE]: "A service dependency is currently unavailable.",

  [ErrorCodes.CLIENT_INVALID_INPUT]: "Invalid input provided. Please check your request.",
  [ErrorCodes.CLIENT_UNSUPPORTED_OPERATION]: "This operation is not supported.",

  [ErrorCodes.UNKNOWN_ERROR]: "An unknown error occurred. Please try again later.",
}

// Function to categorize errors based on error message or type
export function categorizeError(error: Error | string): ErrorCategory {
  const message = typeof error === "string" ? error : error.message
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("api key") || lowerMessage.includes("auth") || lowerMessage.includes("unauthorized")) {
    return ErrorCategory.AUTHENTICATION
  }

  if (lowerMessage.includes("permission") || lowerMessage.includes("forbidden")) {
    return ErrorCategory.AUTHORIZATION
  }

  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("connection") ||
    lowerMessage.includes("econnrefused")
  ) {
    return ErrorCategory.CONNECTIVITY
  }

  if (
    lowerMessage.includes("rate limit") ||
    lowerMessage.includes("too many requests") ||
    lowerMessage.includes("429")
  ) {
    return ErrorCategory.RATE_LIMIT
  }

  if (lowerMessage.includes("timeout") || lowerMessage.includes("timed out")) {
    return ErrorCategory.TIMEOUT
  }

  if (lowerMessage.includes("validation") || lowerMessage.includes("invalid")) {
    return ErrorCategory.VALIDATION
  }

  if (lowerMessage.includes("model") || lowerMessage.includes("context length") || lowerMessage.includes("token")) {
    return ErrorCategory.MODEL_ERROR
  }

  if (lowerMessage.includes("server") || lowerMessage.includes("500")) {
    return ErrorCategory.SERVER_ERROR
  }

  if (lowerMessage.includes("client") || lowerMessage.includes("400")) {
    return ErrorCategory.CLIENT_ERROR
  }

  return ErrorCategory.UNKNOWN
}

// Function to determine error severity based on category and other factors
export function determineErrorSeverity(
  category: ErrorCategory,
  statusCode?: number,
  isRecurring = false,
): ErrorSeverity {
  // Critical errors
  if (
    category === ErrorCategory.SERVER_ERROR ||
    (statusCode && statusCode >= 500) ||
    (isRecurring && (category === ErrorCategory.CONNECTIVITY || category === ErrorCategory.AUTHENTICATION))
  ) {
    return ErrorSeverity.CRITICAL
  }

  // Error level
  if (
    category === ErrorCategory.AUTHENTICATION ||
    category === ErrorCategory.AUTHORIZATION ||
    category === ErrorCategory.CONNECTIVITY ||
    (statusCode && statusCode >= 400 && statusCode < 500)
  ) {
    return ErrorSeverity.ERROR
  }

  // Warning level
  if (
    category === ErrorCategory.RATE_LIMIT ||
    category === ErrorCategory.TIMEOUT ||
    category === ErrorCategory.VALIDATION
  ) {
    return ErrorSeverity.WARNING
  }

  // Default to info
  return ErrorSeverity.INFO
}

// Main error logging function
export function logError(
  error: Error | string,
  source: string,
  metadata: Record<string, any> = {},
  userId?: string,
  sessionId?: string,
  requestId?: string,
): ErrorLog {
  const message = typeof error === "string" ? error : error.message
  const stack = typeof error === "string" ? undefined : error.stack
  const category = categorizeError(error)
  const severity = determineErrorSeverity(category, metadata.statusCode, metadata.isRecurring)

  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    message,
    severity,
    category,
    source,
    userId,
    sessionId,
    requestId,
    errorCode: metadata.errorCode || determineErrorCode(category, message),
    stackTrace: stack,
    metadata,
  }

  // Log to console with appropriate level
  switch (severity) {
    case ErrorSeverity.DEBUG:
      console.debug(`[${source}] ${message}`, errorLog)
      break
    case ErrorSeverity.INFO:
      console.info(`[${source}] ${message}`, errorLog)
      break
    case ErrorSeverity.WARNING:
      console.warn(`[${source}] ${message}`, errorLog)
      break
    case ErrorSeverity.ERROR:
    case ErrorSeverity.CRITICAL:
      console.error(`[${source}] ${message}`, errorLog)
      break
  }

  // In a production environment, you would send this to a logging service
  // sendToLoggingService(errorLog);

  return errorLog
}

// Determine the most likely error code based on category and message
function determineErrorCode(category: ErrorCategory, message: string): string {
  const lowerMessage = message.toLowerCase()

  switch (category) {
    case ErrorCategory.AUTHENTICATION:
      if (lowerMessage.includes("invalid")) return ErrorCodes.AUTH_INVALID_KEY
      if (lowerMessage.includes("expired")) return ErrorCodes.AUTH_EXPIRED_KEY
      return ErrorCodes.AUTH_INSUFFICIENT_PERMISSIONS

    case ErrorCategory.CONNECTIVITY:
      if (lowerMessage.includes("timeout")) return ErrorCodes.CONN_TIMEOUT
      if (lowerMessage.includes("unavailable")) return ErrorCodes.CONN_SERVICE_UNAVAILABLE
      return ErrorCodes.CONN_NETWORK_FAILURE

    case ErrorCategory.RATE_LIMIT:
      if (lowerMessage.includes("quota")) return ErrorCodes.RATE_QUOTA_EXCEEDED
      return ErrorCodes.RATE_TOO_MANY_REQUESTS

    case ErrorCategory.MODEL_ERROR:
      if (lowerMessage.includes("context") || lowerMessage.includes("token"))
        return ErrorCodes.MODEL_CONTEXT_LENGTH_EXCEEDED
      if (lowerMessage.includes("filter") || lowerMessage.includes("content policy"))
        return ErrorCodes.MODEL_CONTENT_FILTERED
      return ErrorCodes.MODEL_INVALID_RESPONSE

    case ErrorCategory.SERVER_ERROR:
      if (lowerMessage.includes("dependency")) return ErrorCodes.SERVER_DEPENDENCY_FAILURE
      return ErrorCodes.SERVER_INTERNAL_ERROR

    case ErrorCategory.CLIENT_ERROR:
      if (lowerMessage.includes("invalid")) return ErrorCodes.CLIENT_INVALID_INPUT
      return ErrorCodes.CLIENT_UNSUPPORTED_OPERATION

    default:
      return ErrorCodes.UNKNOWN_ERROR
  }
}

// Get a user-friendly error message based on error code
export function getUserFriendlyErrorMessage(errorCode: string): string {
  return ErrorMessages[errorCode] || ErrorMessages[ErrorCodes.UNKNOWN_ERROR]
}

// Function to show error toast with appropriate styling based on severity
export function showErrorToast(title: string, message: string, severity: ErrorSeverity = ErrorSeverity.ERROR) {
  const variant =
    severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.ERROR
      ? "destructive"
      : severity === ErrorSeverity.WARNING
        ? "default"
        : "default"

  toast({
    title,
    description: message,
    variant,
  })
}

// Mock function for sending to a logging service
// In a real implementation, this would send to a service like Sentry, Datadog, etc.
function sendToLoggingService(errorLog: ErrorLog) {
  // Implementation would depend on your logging service
  console.log("Sending to logging service:", errorLog)
}
