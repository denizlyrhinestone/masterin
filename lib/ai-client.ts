import { openai } from "@ai-sdk/openai"
import { groq } from "@ai-sdk/groq"
import { xai } from "@ai-sdk/xai"
import type { Message } from "ai"

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

/**
 * Prepare system message for the AI tutor
 */
export function getAITutorSystemMessage(subject?: string): string {
  let systemMessage = `You are an educational AI tutor for middle and high school students. 
Your goal is to help students learn by guiding them through problems, not just giving answers. 
Ask questions to help students discover solutions themselves. Be encouraging, clear, and concise.
Maintain context throughout the conversation and refer back to previous exchanges when appropriate.
Break down complex topics into understandable parts.`

  if (subject) {
    systemMessage += `\nYou specialize in ${subject} education.`
  }

  return systemMessage
}

/**
 * Create a conversation history object with metadata
 */
export interface ConversationSession {
  id: string
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
  subject?: string
}

/**
 * Create a new conversation session
 */
export function createConversationSession(subject?: string): ConversationSession {
  const timestamp = new Date().toISOString()
  return {
    id: generateSessionId(),
    title: subject ? `${subject} Conversation` : "New Conversation",
    messages: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    subject,
  }
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
