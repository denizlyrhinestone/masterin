// Environment configuration
// This file centralizes all environment variable access

// Feature flags
export const ENABLE_AI_FEATURES = true
export const ENABLE_ADMIN_FEATURES = process.env.ENABLE_ADMIN_FEATURES === "true"
export const ENABLE_ANALYTICS = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true"

// Admin configuration
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ""

// API Keys - only accessible server-side
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

// Safe client-side configuration
// These functions don't expose the actual keys
export const isGroqConfigured = () => !!process.env.GROQ_API_KEY
export const isOpenAIConfigured = () => !!process.env.OPENAI_API_KEY

// Database configuration
export const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || ""

// Supabase configuration
export const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Public configuration that's safe to expose to the client
export const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || ""
export const NEXT_PUBLIC_ENABLE_ANALYTICS = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true"
