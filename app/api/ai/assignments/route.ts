import { NextResponse } from "next/server"
import { generateAssignment } from "@/lib/ai-service"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { subject, topic, difficultyLevel, additionalRequirements } = await request.json()

    // Validate input
    if (!subject || !topic || !difficultyLevel) {
      return NextResponse.json({ error: "Subject, topic, and difficulty level are required" }, { status: 400 })
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

    // Generate assignment
    const assignment = await generateAssignment(subject, topic, difficultyLevel, additionalRequirements)

    // Save to database
    const { data, error } = await supabase
      .from("ai_assignments")
      .insert({
        user_id: userId,
        title: assignment.title,
        subject,
        topic,
        difficulty: difficultyLevel,
        content: assignment,
        is_public: false,
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error saving assignment:", error)
      return NextResponse.json({ error: "Failed to save assignment" }, { status: 500 })
    }

    return NextResponse.json({
      assignment,
      id: data.id,
    })
  } catch (error) {
    console.error("Error in assignment generator API:", error)
    return NextResponse.json({ error: "Failed to generate assignment" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // If ID is provided, get specific assignment
    if (id) {
      const { data, error } = await supabase.from("ai_assignments").select("*").eq("id", id).single()

      if (error) {
        return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
      }

      // Check if user has access
      if (data.user_id !== userId && !data.is_public) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      return NextResponse.json(data)
    }

    // Otherwise, get all assignments for the user
    const { data, error } = await supabase
      .from("ai_assignments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 })
  }
}
