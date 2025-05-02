import { v4 as uuidv4 } from "uuid"
import { logError } from "./utils/log"
import { createClient } from "@supabase/supabase-js"

// Create Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
)

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

    // Prepare request body - don't include sensitive data in logs
    const requestBody = {
      messages: messages.map((msg) => ({
        role: msg.role,
        // Don't log full content for privacy
        content: msg.content.length > 50 ? `${msg.content.substring(0, 50)}...` : msg.content,
      })),
      conversationId,
      toolType,
      temperature,
      maxTokens,
    }

    // Log sanitized request for debugging
    console.log("Sending chat request:", {
      messageCount: messages.length,
      conversationId,
      toolType,
    })

    // Send request to API
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        conversationId,
        toolType,
        temperature,
        maxTokens,
      }), // Send full data to API
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
    // Log error without exposing sensitive information
    logError(error instanceof Error ? error : new Error(String(error)), {
      severity: "medium",
      tags: ["ai", "chat"],
      context: {
        toolType,
        conversationId,
        messageCount: messages?.length || 0,
      },
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
 * Saves a chat conversation to the database
 * @param userId User ID
 * @param conversationId Conversation ID
 * @param messages Chat messages
 * @returns Promise resolving to success status
 */
export async function saveChatConversation(
  userId: string,
  conversationId: string,
  messages: Array<{ role: string; content: string }>,
): Promise<{ success: boolean; error?: Error }> {
  try {
    const { error } = await supabase.from("chat_conversations").upsert(
      {
        id: conversationId,
        user_id: userId,
        messages: JSON.stringify(messages),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      },
    )

    if (error) throw error

    return { success: true }
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), {
      severity: "medium",
      tags: ["ai", "chat", "database"],
      context: {
        conversationId,
        userId,
        messageCount: messages?.length || 0,
      },
    })

    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}
