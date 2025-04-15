import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { isConnected } = await request.json()

    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Update connection
    const { data, error } = await supabase
      .from("lms_connections")
      .update({
        is_connected: isConnected,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single()

    if (error) {
      console.error("Error updating LMS connection:", error)
      return NextResponse.json({ error: "Failed to update LMS connection" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in LMS connections API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Delete connection
    const { error } = await supabase.from("lms_connections").delete().eq("id", id).eq("user_id", userId)

    if (error) {
      console.error("Error deleting LMS connection:", error)
      return NextResponse.json({ error: "Failed to delete LMS connection" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in LMS connections API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get connection
    const { data, error } = await supabase
      .from("lms_connections")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single()

    if (error) {
      console.error("Error fetching LMS connection:", error)
      return NextResponse.json({ error: "Failed to fetch LMS connection" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in LMS connections API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
