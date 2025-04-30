/**
 * Standardized error codes for authentication
 */
export type AuthErrorCode =
  // Authentication errors
  | "invalid_credentials"
  | "email_not_confirmed"
  | "email_in_use"
  | "invalid_token"
  | "expired_token"
  | "weak_password"
  | "passwords_dont_match"
  | "invalid_email"
  | "invalid_input"

  // Rate limiting
  | "too_many_requests"

  // Server errors
  | "server_error"
  | "service_unavailable"

  // Network errors
  | "network_error"
  | "timeout_error"

  // Generic errors
  | "unknown_error"

/**
 * Standardized error interface
 */
export interface StandardError {
  code: AuthErrorCode
  message: string
  field?: string
  originalError?: any
}

/**
 * Error messages for each error code
 */
const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  // Authentication errors
  invalid_credentials: "The email or password you entered is incorrect.",
  email_not_confirmed: "Please verify your email address before signing in.",
  email_in_use: "This email is already registered. Please sign in or use a different email.",
  invalid_token: "The authentication token is invalid or has expired.",
  expired_token: "Your session has expired. Please sign in again.",
  weak_password: "Please choose a stronger password.",
  passwords_dont_match: "The passwords you entered don't match.",
  invalid_email: "Please enter a valid email address.",
  invalid_input: "Please check your input and try again.",

  // Rate limiting
  too_many_requests: "Too many attempts. Please try again later.",

  // Server errors
  server_error: "An error occurred on our server. Please try again later.",
  service_unavailable: "This service is temporarily unavailable. Please try again later.",

  // Network errors
  network_error: "A network error occurred. Please check your connection and try again.",
  timeout_error: "The request timed out. Please try again.",

  // Generic errors
  unknown_error: "An unexpected error occurred. Please try again.",
}

/**
 * Convert Supabase errors to standardized errors
 */
export function standardizeSupabaseError(error: any): StandardError {
  // Handle null or undefined
  if (!error) {
    return {
      code: "unknown_error",
      message: ERROR_MESSAGES.unknown_error,
    }
  }

  // Extract error message
  const errorMessage = error.message || error.error_description || ""

  // Match Supabase error messages to our standard error codes
  if (errorMessage.includes("Invalid login credentials")) {
    return {
      code: "invalid_credentials",
      message: ERROR_MESSAGES.invalid_credentials,
      originalError: error,
    }
  }

  if (errorMessage.includes("Email not confirmed")) {
    return {
      code: "email_not_confirmed",
      message: ERROR_MESSAGES.email_not_confirmed,
      originalError: error,
    }
  }

  if (errorMessage.includes("already registered")) {
    return {
      code: "email_in_use",
      message: ERROR_MESSAGES.email_in_use,
      originalError: error,
    }
  }

  if (errorMessage.includes("JWT expired")) {
    return {
      code: "expired_token",
      message: ERROR_MESSAGES.expired_token,
      originalError: error,
    }
  }

  if (errorMessage.includes("JWT")) {
    return {
      code: "invalid_token",
      message: ERROR_MESSAGES.invalid_token,
      originalError: error,
    }
  }

  // Default to unknown error
  return {
    code: "unknown_error",
    message: ERROR_MESSAGES.unknown_error,
    originalError: error,
  }
}

/**
 * Create a standard error object
 */
export function createError(
  code: AuthErrorCode,
  customMessage?: string,
  field?: string,
  originalError?: any,
): StandardError {
  return {
    code,
    message: customMessage || ERROR_MESSAGES[code],
    field,
    originalError,
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): StandardError | null {
  if (!email) {
    return createError("invalid_email", "Email is required", "email")
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return createError("invalid_email", "Please enter a valid email address", "email")
  }

  return null
}

/**
 * Validate password strength
 */
export function validatePassword(
  password: string,
  options: {
    minLength?: number
    requireUppercase?: boolean
    requireLowercase?: boolean
    requireNumbers?: boolean
    requireSpecialChars?: boolean
  } = {},
): StandardError | null {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = false,
  } = options

  if (!password) {
    return createError("invalid_input", "Password is required", "password")
  }

  if (password.length < minLength) {
    return createError("weak_password", `Password must be at least ${minLength} characters`, "password")
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return createError("weak_password", "Password must include at least one uppercase letter", "password")
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return createError("weak_password", "Password must include at least one lowercase letter", "password")
  }

  if (requireNumbers && !/\d/.test(password)) {
    return createError("weak_password", "Password must include at least one number", "password")
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return createError("weak_password", "Password must include at least one special character", "password")
  }

  return null
}

/**
 * Validate password confirmation
 */
export function validatePasswordConfirmation(password: string, confirmPassword: string): StandardError | null {
  if (!confirmPassword) {
    return createError("invalid_input", "Please confirm your password", "confirmPassword")
  }

  if (password !== confirmPassword) {
    return createError("passwords_dont_match", "Passwords do not match", "confirmPassword")
  }

  return null
}

/**
 * Format error for display
 */
export function formatErrorMessage(error: StandardError | null): string {
  if (!error) return ""
  return error.message
}

/**
 * Check if an error is of a specific code
 */
export function isErrorCode(error: any, code: AuthErrorCode): boolean {
  return error?.code === code
}
