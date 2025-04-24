/**
 * Environment variable configuration for Masterin
 * This file centralizes environment variable access and provides defaults
 */

// Admin configuration
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@masterin.org"

// AI service configuration
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY
export const GROQ_API_KEY = process.env.GROQ_API_KEY

// Database configuration
export const DATABASE_URL = process.env.DATABASE_URL
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Feature flags
export const ENABLE_AI_FEATURES = true
export const ENABLE_ADMIN_FEATURES = true

/**
 * Get environment variable with fallback
 * @param key The environment variable key
 * @param defaultValue The default value if not found
 * @returns The environment variable value or default
 */
export function getEnv(key: string, defaultValue = ""): string {
  return process.env[key] || defaultValue
}
