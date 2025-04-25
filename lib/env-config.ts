// Environment configuration

// AI service configuration
export const GROQ_API_KEY = process.env.GROQ_API_KEY || ""
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ""

// Feature flags
export const ENABLE_AI_FEATURES = true
export const ENABLE_ADMIN_FEATURES = process.env.ENABLE_ADMIN_FEATURES === "true"

// Admin configuration
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ""

/**
 * Validate the Groq API key format
 * @returns Object with validation result and message
 */
export function validateGroqApiKey(): { valid: boolean; message: string } {
  if (!GROQ_API_KEY) {
    return { valid: false, message: "GROQ_API_KEY is not configured" }
  }

  if (!GROQ_API_KEY.startsWith("gsk_")) {
    return {
      valid: false,
      message: "GROQ_API_KEY has an invalid format (should start with 'gsk_')",
    }
  }

  return { valid: true, message: "GROQ_API_KEY is valid" }
}
