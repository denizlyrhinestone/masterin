import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { groq } from "@ai-sdk/groq"
import { createClient } from "@supabase/supabase-js"
import { GROQ_API_KEY, OPENAI_API_KEY } from "@/lib/env-config"

// Initialize Supabase client for storing conversation history
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a singleton instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Define the available AI models
export type AIModel = "gpt-4o" | "llama3-8b-8192" | "llama3-70b-8192" | "claude-3-opus" | "claude-3-sonnet"

// Define the AI service providers
export type AIProvider = "openai" | "groq" | "anthropic"

// Define the AI tool types
export type AIToolType = "language-tutor" | "study-notes" | "code-mentor" | "math-solver" | "essay-assistant"

// Interface for AI request options
export interface AIRequestOptions {
  model: AIModel
  provider: AIProvider
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  userId?: string
  toolId: AIToolType
  conversationId?: string
}

// Interface for conversation history
export interface ConversationMessage {
  role: "system" | "user" | "assistant"
  content: string
  timestamp?: number
}

/**
 * Generate AI response based on user input
 */
export async function generateAIResponse(
  prompt: string,
  messages: ConversationMessage[] = [],
  options: AIRequestOptions,
): Promise<string> {
  try {
    // Validate API keys
    if (options.provider === "openai" && !OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured")
    }
    if (options.provider === "groq" && !GROQ_API_KEY) {
      throw new Error("Groq API key is not configured")
    }

    // Prepare conversation history
    const conversationHistory = [
      ...(options.systemPrompt
        ? [
            {
              role: "system" as const,
              content: options.systemPrompt,
            },
          ]
        : []),
      ...messages,
      {
        role: "user" as const,
        content: prompt,
      },
    ]

    // Generate response based on provider
    let response
    if (options.provider === "openai") {
      response = await generateText({
        model: openai(options.model as any),
        messages: conversationHistory,
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens,
      })
    } else if (options.provider === "groq") {
      response = await generateText({
        model: groq(options.model as any),
        messages: conversationHistory,
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens,
      })
    } else {
      throw new Error(`Provider ${options.provider} is not supported`)
    }

    // Store conversation in Supabase if user is authenticated and conversationId is provided
    if (options.userId && options.conversationId) {
      await storeConversation(options.userId, options.conversationId, options.toolId, [
        ...messages,
        { role: "user", content: prompt },
        { role: "assistant", content: response.text },
      ])
    }

    return response.text
  } catch (error) {
    console.error("Error generating AI response:", error)
    throw error
  }
}

/**
 * Store conversation history in Supabase
 */
async function storeConversation(
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
