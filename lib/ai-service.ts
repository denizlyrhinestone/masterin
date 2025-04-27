/**
 * AI Service module for interacting with AI models
 * @module ai-service
 */

import { v4 as uuidv4 } from "uuid"
import { createClient } from "@supabase/supabase-js"
import { logError } from "./error-logger"

// Initialize Supabase client for storing conversation history
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a singleton instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Define the AI tool types
export type AIToolType = "language-tutor" | "study-notes" | "code-mentor" | "math-solver" | "essay-assistant"

// Interface for conversation history
export interface ConversationMessage {
  role: "system" | "user" | "assistant"
  content: string
  timestamp?: number
}

/**
 * Sends a message to the AI chat service
 * @async
 * @param {Array<{role: string, content: string}>} messages - The messages to send
 * @param {Object} options - Options for the chat request
 * @returns {Promise<{text: string, conversationId: string, error?: Error}>} The chat response
 */
export async function sendChatMessage(
  messages: Array<{ role: string; content: string }>,
  options: {
    conversationId?: string
    toolType?: string
    temperature?: number
    maxTokens?: number
  } = {},
): Promise<{
  text: string
  conversationId: string
  error?: Error
}> {
  const { conversationId = `conv-${uuidv4()}`, toolType, temperature, maxTokens } = options

  try {
    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("Invalid messages: Messages must be a non-empty array")
    }

    // Prepare request body
    const requestBody = {
      messages,
      conversationId,
      toolType,
      temperature,
      maxTokens,
    }

    // Send request to API
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage = `Error: ${response.status} ${response.statusText}`

      try {
        const errorData = await response.json()
        if (errorData.error) {
          errorMessage = errorData.error
        }
      } catch (e) {
        // If we can't parse JSON, use the default error message
      }

      throw new Error(errorMessage)
    }

    // Parse response
    const data = await response.json()

    return {
      text: data.text,
      conversationId: data.conversationId || conversationId,
    }
  } catch (error) {
    // Log error
    logError(error instanceof Error ? error : new Error(String(error)), {
      severity: "medium",
      tags: ["ai", "chat"],
      context: { toolType, conversationId },
    })

    // Return error in response
    return {
      text: "I'm sorry, I encountered an error while processing your request. Please try again later.",
      conversationId,
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

/**
 * Store conversation history in Supabase
 */
export async function storeConversation(
  userId: string,
  conversationId: string,
  toolType: AIToolType,
  messages: ConversationMessage[],
) {
  try {
    // Check if conversation exists
    const { data: existingConversation } = await supabase
      .from("ai_conversations")
      .select("id")
      .eq("id", conversationId)
      .single()

    // If conversation doesn't exist, create it
    if (!existingConversation) {
      await supabase.from("ai_conversations").insert({
        id: conversationId,
        user_id: userId,
        tool_type: toolType,
        created_at: new Date().toISOString(),
      })
    }

    // Store messages
    const messagesToInsert = messages.map((message) => ({
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
      created_at: new Date().toISOString(),
    }))

    await supabase.from("ai_conversation_messages").insert(messagesToInsert)
  } catch (error) {
    console.error("Error storing conversation:", error)
    // Don't throw here to prevent blocking the main functionality
  }
}

/**
 * Get conversation history from Supabase
 */
export async function getConversationHistory(conversationId: string): Promise<ConversationMessage[]> {
  try {
    const { data, error } = await supabase
      .from("ai_conversation_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    if (error) throw error

    return (
      data?.map((message) => ({
        role: message.role as "system" | "user" | "assistant",
        content: message.content,
        timestamp: new Date(message.created_at).getTime(),
      })) || []
    )
  } catch (error) {
    console.error("Error fetching conversation history:", error)
    return []
  }
}

/**
 * Get user's recent conversations
 */
export async function getUserConversations(userId: string, toolType?: AIToolType) {
  try {
    let query = supabase
      .from("ai_conversations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (toolType) {
      query = query.eq("tool_type", toolType)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching user conversations:", error)
    return []
  }
}

/**
 * Tool types for AI tools
 * @enum {string}
 */
export const ToolType = {
  /** General AI tutor */
  TUTOR: "tutor",
  /** Math problem solver */
  MATH: "math",
  /** Code mentor */
  CODE: "code",
  /** Language tutor */
  LANGUAGE: "language",
  /** Essay assistant */
  ESSAY: "essay",
} as const

/**
 * Type for tool types
 * @typedef {typeof ToolType[keyof typeof ToolType]} ToolTypeValue
 */
export type ToolTypeValue = (typeof ToolType)[keyof typeof ToolType]

/**
 * Gets the system prompt for a specific tool type
 * @param {ToolTypeValue} toolType - The tool type
 * @returns {string} The system prompt
 */
export function getSystemPrompt(toolType: ToolTypeValue): string {
  switch (toolType) {
    case ToolType.TUTOR:
      return "You are an AI tutor from Masterin, designed to help students learn and understand various subjects. Provide clear, concise explanations and ask questions to guide the student's learning."

    case ToolType.MATH:
      return "You are a math problem solver from Masterin. Your goal is to help students solve math problems by providing step-by-step solutions and explanations. Break down complex problems into manageable steps."

    case ToolType.CODE:
      return "You are a code mentor from Masterin. Your goal is to help students learn programming by explaining code, debugging issues, and providing guidance on best practices. Use code examples to illustrate concepts."

    case ToolType.LANGUAGE:
      return "You are a language tutor from Masterin. Your goal is to help students learn and practice languages. Correct grammar and vocabulary errors, provide translations, and engage in conversations to improve fluency."

    case ToolType.ESSAY:
      return "You are an essay assistant from Masterin. Your goal is to help students plan, write, and edit essays. Provide feedback on structure, clarity, and argumentation. Help with brainstorming ideas and improving writing style."

    default:
      return "You are an AI assistant from Masterin, designed to help students with their educational needs. Provide helpful, accurate, and educational responses."
  }
}
