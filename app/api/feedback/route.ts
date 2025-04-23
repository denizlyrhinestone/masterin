import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

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

    // Parse request body
    const { messageId, feedbackType, details } = await req.json()

    if (!messageId || !feedbackType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate feedback type
    if (!["positive", "negative"].includes(feedbackType)) {
      return NextResponse.json({ error: "Invalid feedback type" }, { status: 400 })
    }

    // Get the message to ensure it exists and belongs to the user
    const { data: message, error: messageError } = await supabase
      .from("chat_messages")
      .select("id, conversation_id")
      .eq("id", messageId)
      .single()

    if (messageError || !message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Verify the user owns the conversation
    const { data: conversation, error: conversationError } = await supabase
      .from("chat_conversations")
      .select("id")
      .eq("id", message.conversation_id)
      .eq("user_id", session.user.id)
      .single()

    if (conversationError || !conversation) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Store the feedback
    const { error: feedbackError } = await supabase.from("message_feedback").insert({
      message_id: messageId,
      user_id: session.user.id,
      feedback_type: feedbackType,
      details: details || null,
      created_at: new Date().toISOString(),
    })

    if (feedbackError) {
      console.error("Error storing feedback:", feedbackError)
      return NextResponse.json({ error: "Failed to store feedback" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Feedback API error:", error)
    return NextResponse.json(
      {
        error: "An error occurred while processing your request",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    )
  }
}
