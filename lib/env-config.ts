// Environment configuration

// Feature flags
export const ENABLE_AI_FEATURES = true
export const ENABLE_ADMIN_FEATURES = process.env.ENABLE_ADMIN_FEATURES === "true"

// Admin configuration
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ""

// API Keys (server-side only)
export const GROQ_API_KEY = process.env.GROQ_API_KEY || ""
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ""

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

/**
 * Validate the OpenAI API key format
 * @returns Object with validation result and message
 */
export function validateOpenAIApiKey(): { valid: boolean; message: string } {
  if (!OPENAI_API_KEY) {
    return { valid: false, message: "OPENAI_API_KEY is not configured" }
  }

  if (!OPENAI_API_KEY.startsWith("sk-")) {
    return {
      valid: false,
      message: "OPENAI_API_KEY has an invalid format (should start with 'sk-')",
    }
  }

  return { valid: true, message: "OPENAI_API_KEY is valid" }
}

// IMPORTANT: Do not export the actual API keys to client components
// Instead, create methods that can be called from API routes

/**
 * Safe method to check if Groq API is configured
 * This is safe to use in client components as it doesn't expose the actual key
 */
export function isGroqConfigured(): boolean {
  return !!GROQ_API_KEY && GROQ_API_KEY.startsWith("gsk_")
}

/**
 * Safe method to check if OpenAI API is configured
 * This is safe to use in client components as it doesn't expose the actual key
 */
export function isOpenAIConfigured(): boolean {
  return !!OPENAI_API_KEY && OPENAI_API_KEY.startsWith("sk-")
}
