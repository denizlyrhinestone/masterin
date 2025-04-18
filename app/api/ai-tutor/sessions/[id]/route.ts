import { NextResponse } from "next/server"

// In a real application, this would be stored in a database
// For this demo, we'll use an in-memory store
const sessions: Record<string, any> = {}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const sessionId = params.id

    if (!sessionId || !sessions[sessionId]) {
      return new NextResponse(JSON.stringify({ error: "Session not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    return NextResponse.json(sessions[sessionId])
  } catch (error) {
    console.error("Error fetching session:", error)
    return new NextResponse(
      JSON.stringify({
        error: "Failed to fetch session",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const sessionId = params.id
    const body = await request.json()
    const { messages, title } = body

    if (!sessionId || !sessions[sessionId]) {
      return new NextResponse(JSON.stringify({ error: "Session not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Update the session
    if (messages) {
      sessions[sessionId].messages = messages
    }

    if (title) {
      sessions[sessionId].title = title
    }

    sessions[sessionId].updatedAt = new Date().toISOString()

    return NextResponse.json(sessions[sessionId])
  } catch (error) {
    console.error("Error updating session:", error)
    return new NextResponse(
      JSON.stringify({
        error: "Failed to update session",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const sessionId = params.id

    if (!sessionId || !sessions[sessionId]) {
      return new NextResponse(JSON.stringify({ error: "Session not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Delete the session
    delete sessions[sessionId]

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting session:", error)
    return new NextResponse(
      JSON.stringify({
        error: "Failed to delete session",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
