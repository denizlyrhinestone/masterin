import { NextResponse } from "next/server"
import { getAITutorResponse } from "@/lib/ai-service"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { question, subject, userLevel, sessionId } = await request.json()

    // Validate input
    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    // Get user from session
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get AI response
    const aiResponse = await getAITutorResponse(question, subject, userLevel)

    // Save message to database
    let currentSessionId = sessionId

    // If no session ID provided, create a new session
    if (!currentSessionId) {
      const { data: sessionData, error: sessionError } = await supabase
        .from("ai_tutor_sessions")
        .insert({
          user_id: userId,
          title: question.substring(0, 50) + (question.length > 50 ? "..." : ""),
          subject: subject || null,
        })
        .select("id")
        .single()

      if (sessionError) {
        console.error("Error creating tutor session:", sessionError)
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
      }

      currentSessionId = sessionData.id
    }

    // Save user message
    const { error: userMsgError } = await supabase.from("ai_tutor_messages").insert({
      session_id: currentSessionId,
      content: question,
      sender: "user",
    })

    if (userMsgError) {
      console.error("Error saving user message:", userMsgError)
    }

    // Save AI response
    const { error: aiMsgError } = await supabase.from("ai_tutor_messages").insert({
      session_id: currentSessionId,
      content: JSON.stringify(aiResponse),
      sender: "ai",
    })

    if (aiMsgError) {
      console.error("Error saving AI message:", aiMsgError)
    }

    // Update session timestamp
    await supabase.from("ai_tutor_sessions").update({ updated_at: new Date().toISOString() }).eq("id", currentSessionId)

    return NextResponse.json({
      response: aiResponse,
      sessionId: currentSessionId,
    })
  } catch (error) {
    console.error("Error in AI tutor API:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
