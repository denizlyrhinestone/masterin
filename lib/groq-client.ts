import { groq } from "@ai-sdk/groq"
import { GROQ_API_KEY, validateGroqApiKey } from "./env-config"

// Check if Groq API key is available and valid
const apiKeyValidation = validateGroqApiKey()
const isGroqAvailable = apiKeyValidation.valid

// Create Groq client with the API key only if it's valid
export const groqClient = isGroqAvailable ? groq(GROQ_API_KEY) : null

// Export a function to check if Groq is available
export const checkGroqAvailability = () => {
  return {
    available: isGroqAvailable,
    message: apiKeyValidation.message,
  }
}

/**
 * Get a masked version of the API key for display purposes
 * @returns Masked API key or message if not available
 */
export function getMaskedApiKey(): string {
  if (!GROQ_API_KEY) {
    return "Not configured"
  }

  // Show only first 4 and last 4 characters
  const firstFour = GROQ_API_KEY.substring(0, 4)
  const lastFour = GROQ_API_KEY.substring(GROQ_API_KEY.length - 4)
  return `${firstFour}...${lastFour}`
}

/**
 * Log API usage for monitoring and rate limiting
 * @param endpoint The API endpoint used
 * @param status The response status
 * @param duration The request duration in ms
 */
export function logApiUsage(endpoint: string, status: number, duration: number): void {
  console.log(`[GROQ API] ${endpoint} - Status: ${status} - Duration: ${duration}ms`)

  // In a production app, you might want to store this in a database
  // or send it to a monitoring service
}
