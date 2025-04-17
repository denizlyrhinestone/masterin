/**
 * Base error class for application errors
 */
export class AppError extends Error {
  code: string
  details: any

  constructor(message: string, code = "APP_ERROR", details: any = {}) {
    super(message)
    this.name = "AppError"
    this.code = code
    this.details = details
  }
}

/**
 * Error class for database-related errors
 */
export class DatabaseError extends AppError {
  constructor(message: string, code = "DATABASE_ERROR", details: any = {}) {
    super(message, code, details)
    this.name = "DatabaseError"
  }
}

/**
 * Error class for API-related errors
 */
export class ApiError extends AppError {
  statusCode: number

  constructor(message: string, statusCode = 500, code = "API_ERROR", details: any = {}) {
    super(message, code, details)
    this.name = "ApiError"
    this.statusCode = statusCode
  }
}

/**
 * Error class for validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string, details: any = {}) {
    super(message, "VALIDATION_ERROR", details)
    this.name = "ValidationError"
  }
}

/**
 * Error class for authentication errors
 */
export class AuthError extends AppError {
  constructor(message: string, details: any = {}) {
    super(message, "AUTH_ERROR", details)
    this.name = "AuthError"
  }
}

/**
 * Error class for rate limiting errors
 */
export class RateLimitError extends AppError {
  constructor(message: string, details: any = {}) {
    super(message, "RATE_LIMIT_ERROR", details)
    this.name = "RateLimitError"
  }
}
