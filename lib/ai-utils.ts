import { openai } from "@ai-sdk/openai"
import { groq } from "@ai-sdk/groq"
import { xai } from "@ai-sdk/xai"

type ModelProvider = "openai" | "groq" | "xai" | "fallback"

// Interface for AI model service health
interface AIServiceHealth {
  provider: ModelProvider
  lastChecked: number
  status: "available" | "unavailable" | "unknown"
  responseTime?: number
  errorCount: number
}

// Track AI service health
const serviceHealth: Record<string, AIServiceHealth> = {
  openai: { provider: "openai", lastChecked: 0, status: "unknown", errorCount: 0 },
  groq: { provider: "groq", lastChecked: 0, status: "unknown", errorCount: 0 },
  xai: { provider: "xai", lastChecked: 0, status: "unknown", errorCount: 0 },
}

function validateApiKey(key: string | undefined, provider: ModelProvider): boolean {
  if (!key) return false

  // Basic validation of key formats with more permissive checks
  switch (provider) {
    case "openai":
      // Allow both formats: "sk-..." or the newer format
      return key.length > 20
    case "groq":
      // Allow both formats: "gsk_..." or the newer format
      return key.length > 20
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
    console.warn(`AI provider ${provider} reported unavailable. Error count: ${health.errorCount}`)
    if (error) {
      console.error(`Error with ${provider}:`, error.message)
    }
  } else {
    health.errorCount = 0
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
 * Selects the best available AI model based on environment variables and health status
 */
export function selectAIModel() {
  console.log("Selecting AI model with available APIs...")

  try {
    // Check for OpenAI API key
    if (
      process.env.OPENAI_API_KEY &&
      validateApiKey(process.env.OPENAI_API_KEY, "openai") &&
      (serviceHealth.openai.status !== "unavailable" || serviceHealth.openai.errorCount < 3)
    ) {
      console.log("Using OpenAI model")
      return {
        model: openai("gpt-4o"),
        provider: "openai" as ModelProvider,
      }
    }
  } catch (error) {
    console.error("Error initializing OpenAI model:", error)
    updateServiceHealth("openai", "unavailable", undefined, error as Error)
  }

  try {
    // Check for Groq API key
    if (
      process.env.GROQ_API_KEY &&
      validateApiKey(process.env.GROQ_API_KEY, "groq") &&
      (serviceHealth.groq.status !== "unavailable" || serviceHealth.groq.errorCount < 3)
    ) {
      console.log("Using Groq model")
      return {
        model: groq("llama3-70b-8192"),
        provider: "groq" as ModelProvider,
      }
    }
  } catch (error) {
    console.error("Error initializing Groq model:", error)
    updateServiceHealth("groq", "unavailable", undefined, error as Error)
  }

  try {
    // Check for XAI (Grok) API key
    if (
      process.env.XAI_API_KEY &&
      validateApiKey(process.env.XAI_API_KEY, "xai") &&
      (serviceHealth.xai.status !== "unavailable" || serviceHealth.xai.errorCount < 3)
    ) {
      console.log("Using XAI (Grok) model")
      return {
        model: xai("grok-1"),
        provider: "xai" as ModelProvider,
      }
    }
  } catch (error) {
    console.error("Error initializing XAI model:", error)
    updateServiceHealth("xai", "unavailable", undefined, error as Error)
  }

  // Fallback: try any provider that hasn't failed too many times, even if marked unavailable
  if (process.env.OPENAI_API_KEY && serviceHealth.openai.errorCount < 5) {
    console.log("Fallback to OpenAI model despite previous errors")
    return {
      model: openai("gpt-4o"),
      provider: "openai" as ModelProvider,
    }
  }

  if (process.env.GROQ_API_KEY && serviceHealth.groq.errorCount < 5) {
    console.log("Fallback to Groq model despite previous errors")
    return {
      model: groq("llama3-70b-8192"),
      provider: "groq" as ModelProvider,
    }
  }

  if (process.env.XAI_API_KEY && serviceHealth.xai.errorCount < 5) {
    console.log("Fallback to XAI model despite previous errors")
    return {
      model: xai("grok-1"),
      provider: "xai" as ModelProvider,
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

/**
 * Performs a diagnostic check on AI model configuration
 */
export async function performAIDiagnostics(): Promise<{
  availableProviders: string[]
  configurationIssues: string[]
  recommendations: string[]
}> {
  const diagnostics = {
    availableProviders: [] as string[],
    configurationIssues: [] as string[],
    recommendations: [] as string[],
  }

  // Check OpenAI configuration
  if (process.env.OPENAI_API_KEY) {
    if (validateApiKey(process.env.OPENAI_API_KEY, "openai")) {
      diagnostics.availableProviders.push("openai")
    } else {
      diagnostics.configurationIssues.push("OpenAI API key appears to be invalid")
      diagnostics.recommendations.push("Verify your OpenAI API key format and validity")
    }
  } else {
    diagnostics.configurationIssues.push("OpenAI API key is missing")
  }

  // Check Groq configuration
  if (process.env.GROQ_API_KEY) {
    if (validateApiKey(process.env.GROQ_API_KEY, "groq")) {
      diagnostics.availableProviders.push("groq")
    } else {
      diagnostics.configurationIssues.push("Groq API key appears to be invalid")
      diagnostics.recommendations.push("Verify your Groq API key format and validity")
    }
  }

  // Check XAI configuration
  if (process.env.XAI_API_KEY) {
    if (validateApiKey(process.env.XAI_API_KEY, "xai")) {
      diagnostics.availableProviders.push("xai")
    } else {
      diagnostics.configurationIssues.push("XAI API key appears to be invalid")
      diagnostics.recommendations.push("Verify your XAI API key format and validity")
    }
  }

  // Overall recommendations
  if (diagnostics.availableProviders.length === 0) {
    diagnostics.recommendations.push("Configure at least one AI provider (OpenAI, Groq, or XAI)")
  } else if (diagnostics.availableProviders.length === 1) {
    diagnostics.recommendations.push("Configure backup AI providers for better reliability")
  }

  return diagnostics
}
