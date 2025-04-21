import { openai } from "@ai-sdk/openai"
import { groq } from "@ai-sdk/groq"
import { xai } from "@ai-sdk/xai"
import { generateText } from "ai"

type ModelProvider = "openai" | "groq" | "xai" | "fallback"

// Interface for AI model service health
interface AIServiceHealth {
  provider: ModelProvider
  lastChecked: number
  status: "available" | "unavailable" | "unknown"
  responseTime?: number
  errorCount: number
  lastError?: string
}

// Track AI service health - using a global variable to persist across requests
const serviceHealth: Record<string, AIServiceHealth> = {
  openai: { provider: "openai", lastChecked: 0, status: "unknown", errorCount: 0 },
  groq: { provider: "groq", lastChecked: 0, status: "unknown", errorCount: 0 },
  xai: { provider: "xai", lastChecked: 0, status: "unknown", errorCount: 0 },
}

/**
 * Validates that the API key for a provider has the correct format
 */
function validateApiKey(key: string | undefined, provider: ModelProvider): boolean {
  if (!key) return false

  // Basic validation of key formats
  switch (provider) {
    case "openai":
      return key.startsWith("sk-") && key.length > 20
    case "groq":
      return key.startsWith("gsk_") && key.length > 20
    case "xai":
      return key.length > 20 // XAI key format validation
    default:
      return false
  }
}

/**
 * Updates the health status of an AI service provider
 */
export function updateServiceHealth(
  provider: ModelProvider,
  status: "available" | "unavailable",
  responseTime?: number,
  error?: Error,
): void {
  if (!serviceHealth[provider]) return

  const health = serviceHealth[provider]
  health.lastChecked = Date.now()
  health.status = status

  if (responseTime) {
    health.responseTime = responseTime
  }

  if (status === "unavailable") {
    health.errorCount++
    if (error) {
      health.lastError = error.message
    }
    console.warn(`AI provider ${provider} reported unavailable. Error count: ${health.errorCount}`)
  } else {
    health.errorCount = 0
    health.lastError = undefined
  }

  // Log service health to aid debugging
  console.log(`AI Service Health - ${provider}: ${status}${responseTime ? ` (${responseTime}ms)` : ""}`)
}

/**
 * Gets a diagnostic report of the AI service availability
 */
export function getAIServiceHealthReport(): Record<string, AIServiceHealth> {
  return { ...serviceHealth }
}

/**
 * Performs a health check on a specific AI provider
 */
export async function checkProviderHealth(provider: ModelProvider): Promise<boolean> {
  if (provider === "fallback") return false

  try {
    const model = getModelForProvider(provider)
    if (!model) return false

    const startTime = Date.now()

    // Simple health check query
    await generateText({
      model,
      prompt: "Health check. Please respond with 'OK'.",
      maxTokens: 5,
    })

    const responseTime = Date.now() - startTime
    updateServiceHealth(provider, "available", responseTime)
    return true
  } catch (error: any) {
    updateServiceHealth(provider, "unavailable", undefined, error)
    console.error(`Health check failed for ${provider}:`, error.message)
    return false
  }
}

/**
 * Gets the appropriate model for a provider
 */
function getModelForProvider(provider: ModelProvider) {
  switch (provider) {
    case "openai":
      return process.env.OPENAI_API_KEY ? openai("gpt-4o") : null
    case "groq":
      return process.env.GROQ_API_KEY ? groq("llama3-70b-8192") : null
    case "xai":
      return process.env.XAI_API_KEY ? xai("grok-1") : null
    default:
      return null
  }
}

/**
 * Selects the best available AI model based on environment variables and health status
 */
export function selectAIModel() {
  // Check if we have valid API keys and select the best available model
  const providers: ModelProvider[] = ["openai", "groq", "xai"]

  // First try providers that are known to be available
  for (const provider of providers) {
    if (isProviderAvailable(provider)) {
      return {
        model: getModelForProvider(provider),
        provider,
      }
    }
  }

  // If no provider is known to be available, try any provider that hasn't failed too many times
  for (const provider of providers) {
    if (canTryProvider(provider)) {
      return {
        model: getModelForProvider(provider),
        provider,
      }
    }
  }

  // Fallback to a simple response generator if no models available
  console.warn("No AI models available, using fallback response generator")
  return {
    model: null,
    provider: "fallback" as ModelProvider,
  }
}

/**
 * Checks if a provider is available based on API key and health status
 */
function isProviderAvailable(provider: ModelProvider): boolean {
  const apiKeys = {
    openai: process.env.OPENAI_API_KEY,
    groq: process.env.GROQ_API_KEY,
    xai: process.env.XAI_API_KEY,
  }

  const key = apiKeys[provider as keyof typeof apiKeys]

  return !!key && validateApiKey(key, provider) && serviceHealth[provider]?.status === "available"
}

/**
 * Checks if we can try a provider even if it's not known to be available
 */
function canTryProvider(provider: ModelProvider): boolean {
  const apiKeys = {
    openai: process.env.OPENAI_API_KEY,
    groq: process.env.GROQ_API_KEY,
    xai: process.env.XAI_API_KEY,
  }

  const key = apiKeys[provider as keyof typeof apiKeys]

  return (
    !!key &&
    validateApiKey(key, provider) &&
    (serviceHealth[provider]?.status !== "unavailable" || serviceHealth[provider]?.errorCount < 3)
  )
}

/**
 * Generates a topic-specific response when no AI model is available
 */
export function generateFallbackResponse(subject: string, message: string): string {
  // Extract potential question topics from the message
  const topics = extractTopics(message)

  const fallbackResponses = {
    math: [
      "In mathematics, it's important to understand the underlying concepts rather than just memorizing formulas. Could you tell me more specifically what math topic you're working on?",
      "Mathematics builds on foundational concepts. Let's break down your question step by step. Could you provide more details about what you're trying to solve?",
      "When approaching math problems, I recommend starting with the basics and working your way up. What specific concept are you struggling with?",
      `I see you're asking about mathematics${topics ? `, possibly related to ${topics}` : ""}. To help you better, could you provide a specific example or problem you're working on?`,
    ],
    science: [
      "Science is all about observation, hypothesis, and experimentation. Could you tell me more about the specific scientific concept you're interested in?",
      "In science, we often use models to understand complex phenomena. What particular aspect of science are you studying?",
      "Scientific understanding evolves over time as we gather more evidence. What specific science topic would you like to explore?",
      `Your question appears to be about science${topics ? `, possibly related to ${topics}` : ""}. Could you clarify which specific scientific principle or phenomenon you'd like to learn about?`,
    ],
    "computer-science": [
      `I understand you're asking about computer science${topics ? `, possibly related to ${topics}` : ""}. Could you provide a specific coding example or concept you're working with?`,
      "In computer science, we focus on algorithms, data structures, and problem-solving approaches. Which specific aspect are you interested in?",
      "Programming involves both syntax and logical thinking. What programming language or concept are you working with?",
    ],
    history: [
      `I see you're interested in history${topics ? `, possibly related to ${topics}` : ""}. Which specific time period, event, or historical figure would you like to learn more about?`,
      "Historical analysis involves examining causes, effects, and multiple perspectives. Which historical topic are you studying?",
    ],
    language: [
      `For your language arts question${topics ? ` about ${topics}` : ""}, could you specify if you need help with writing, grammar, literature analysis, or another aspect?`,
      "Effective writing and communication skills develop through practice and feedback. What specific language arts skill are you working to improve?",
    ],
    general: [
      "Learning is most effective when we connect new information to what we already know. Could you tell me more about what you're trying to learn?",
      "I'd be happy to help you understand this topic better. Could you provide more specific details about your question?",
      "Education is a journey of discovery. Let's explore this topic together. What specific aspects are you curious about?",
      `I notice you're asking${topics ? ` about ${topics}` : " a question"}. To provide the most helpful response, could you elaborate a bit more on what you're trying to understand?`,
    ],
  }

  const subjectResponses = fallbackResponses[subject as keyof typeof fallbackResponses] || fallbackResponses.general
  const randomIndex = Math.floor(Math.random() * subjectResponses.length)
  return subjectResponses[randomIndex]
}

/**
 * Extract potential topics from a user message to make fallback responses more relevant
 */
function extractTopics(message: string): string | null {
  // Simple keyword extraction - in a real implementation, this could be more sophisticated
  const keywords = [
    // Math topics
    "algebra",
    "calculus",
    "geometry",
    "trigonometry",
    "statistics",
    "equation",
    "function",
    "derivative",
    "integral",
    // Science topics
    "physics",
    "chemistry",
    "biology",
    "astronomy",
    "genetics",
    "atom",
    "molecule",
    "cell",
    "gravity",
    // Computer science topics
    "algorithm",
    "programming",
    "code",
    "function",
    "database",
    "javascript",
    "python",
    "html",
    "css",
    // History topics
    "war",
    "revolution",
    "ancient",
    "medieval",
    "world war",
    "civilization",
    "empire",
    "president",
    "king",
    "queen",
    // Language topics
    "grammar",
    "essay",
    "novel",
    "poetry",
    "syntax",
    "paragraph",
    "writing",
    "literature",
    "author",
  ]

  const messageLower = message.toLowerCase()
  const foundKeywords = keywords.filter((keyword) => messageLower.includes(keyword))

  if (foundKeywords.length > 0) {
    // Return up to 3 keywords to avoid overwhelming response
    return foundKeywords.slice(0, 3).join(", ")
  }

  return null
}
