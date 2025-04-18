import { NextResponse } from "next/server"
import { createConversationSession } from "@/lib/ai-client"

// In a real application, this would be stored in a database
// For this demo, we'll use an in-memory store
const sessions: Record<string, any> = {}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return new NextResponse(JSON.stringify({ error: "User ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get all sessions for the user
    const userSessions = Object.values(sessions).filter((session) => session.userId === userId)

    return NextResponse.json({
      sessions: userSessions || [],
    })
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return new NextResponse(
      JSON.stringify({
        error: "Failed to fetch sessions",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, subject } = body

    if (!userId) {
      return new NextResponse(JSON.stringify({ error: "User ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Create a new session
    const newSession = createConversationSession(subject)
    newSession.userId = userId

    // Store the session
    sessions[newSession.id] = newSession

    return NextResponse.json(newSession)
  } catch (error) {
    console.error("Error creating session:", error)
    return new NextResponse(
      JSON.stringify({
        error: "Failed to create session",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
