import { openai } from "@ai-sdk/openai"
import { groq } from "@ai-sdk/groq"
import { xai } from "@ai-sdk/xai"

/**
 * Get the best available AI model based on environment variables
 * Falls back to OpenAI if other models are not available
 */
export function getAIModel() {
  try {
    // Try Groq first if available
    if (process.env.GROQ_API_KEY) {
      return {
        model: groq("llama3-70b-8192"),
        provider: "groq",
        modelName: "llama3-70b-8192",
      }
    }

    // Try XAI if available
    if (process.env.XAI_API_KEY) {
      try {
        return {
          model: xai("grok-1"),
          provider: "xai",
          modelName: "grok-1",
        }
      } catch (error) {
        console.error("Error initializing XAI model:", error)
        // Continue to fallback
      }
    }

    // Fallback to OpenAI
    return {
      model: openai("gpt-3.5-turbo"),
      provider: "openai",
      modelName: "gpt-3.5-turbo",
    }
  } catch (error) {
    console.error("Error in getAIModel:", error)

    // Final fallback
    return {
      model: openai("gpt-3.5-turbo"),
      provider: "openai",
      modelName: "gpt-3.5-turbo",
    }
  }
}
