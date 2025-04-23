import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"
import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// Simple in-memory rate limiter
const rateLimits = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT = 20 // requests per minute
const RATE_WINDOW = 60 * 1000 // 1 minute in milliseconds

async function checkRateLimit(userId: string): Promise<boolean> {
  const now = Date.now()
  const userRateLimit = rateLimits.get(userId)

  if (!userRateLimit) {
    rateLimits.set(userId, { count: 1, timestamp: now })
    return true
  }

  // Reset counter if window has passed
  if (now - userRateLimit.timestamp > RATE_WINDOW) {
    rateLimits.set(userId, { count: 1, timestamp: now })
    return true
  }

  // Check if limit exceeded
  if (userRateLimit.count >= RATE_LIMIT) {
    return false
  }

  // Increment counter
  rateLimits.set(userId, {
    count: userRateLimit.count + 1,
    timestamp: userRateLimit.timestamp,
  })
  return true
}

export async function POST(req: Request) {
  try {
    // Initialize Supabase
    const supabase = createServerSupabaseClient()

    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check rate limit
    const withinLimit = await checkRateLimit(session.user.id)
    if (!withinLimit) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    // Parse request body
    const { messages, conversationId } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
    }

    // Handle conversation persistence
    let conversation
    if (conversationId) {
      // Verify conversation ownership
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .eq("id", conversationId)
        .eq("user_id", session.user.id)
        .single()

      if (error || !data) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
      }

      conversation = data
    } else {
      // Create a new conversation
      const title = messages[0]?.content?.slice(0, 50) + "..." || "New conversation"
      const { data, error } = await supabase
        .from("chat_conversations")
        .insert({
          user_id: session.user.id,
          title,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating conversation:", error)
        return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
      }

      conversation = data
    }

    // Store user message in database
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1]
      if (latestMessage.role === "user") {
        await supabase.from("chat_messages").insert({
          conversation_id: conversation.id,
          role: latestMessage.role,
          content: latestMessage.content,
        })
      }
    }

    // Use the Groq API to generate a response
    const result = streamText({
      model: groq("llama3-70b-8192"),
      system:
        "You are an AI tutor from Masterin, an educational platform. Your goal is to help students learn by providing clear, accurate, and helpful explanations. Focus on being educational, supportive, and engaging. When appropriate, format your responses with markdown for better readability. Include examples, analogies, and step-by-step explanations to help students understand complex topics.",
      messages,
    })

    // Store assistant's response in database when completed
    result.on("done", async (completion) => {
      await supabase.from("chat_messages").insert({
        conversation_id: conversation.id,
        role: "assistant",
        content: completion.content,
      })
    })

    // Include the conversation ID in the response metadata
    return result.toDataStreamResponse((data) => ({
      ...data,
      conversationId: conversation.id,
    }))
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      {
        error: "An error occurred while processing your request",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    )
  }
}
