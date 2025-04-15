import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get all LMS connections for the user
    const { data, error } = await supabase
      .from("lms_connections")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching LMS connections:", error)
      return NextResponse.json({ error: "Failed to fetch LMS connections" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in LMS connections API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { platform, instanceUrl } = await request.json()

    // Validate input
    if (!platform || !instanceUrl) {
      return NextResponse.json({ error: "Platform and instance URL are required" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Check if connection already exists
    const { data: existingConnection } = await supabase
      .from("lms_connections")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", platform)
      .eq("instance_url", instanceUrl)
      .single()

    if (existingConnection) {
      // Update existing connection
      const { data, error } = await supabase
        .from("lms_connections")
        .update({
          is_connected: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingConnection.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating LMS connection:", error)
        return NextResponse.json({ error: "Failed to update LMS connection" }, { status: 500 })
      }

      return NextResponse.json(data)
    } else {
      // Create new connection
      const { data, error } = await supabase
        .from("lms_connections")
        .insert({
          user_id: userId,
          platform,
          instance_url: instanceUrl,
          is_connected: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating LMS connection:", error)
        return NextResponse.json({ error: "Failed to create LMS connection" }, { status: 500 })
      }

      return NextResponse.json(data)
    }
  } catch (error) {
    console.error("Error in LMS connections API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
