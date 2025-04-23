import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { isAdminEmail, checkAdminEmailConfig, logAdminAction } from "@/lib/admin"

export async function POST(req: Request) {
  try {
    // Check if admin email is configured
    const { isConfigured, message } = checkAdminEmailConfig()
    if (!isConfigured) {
      console.error(`Admin config check failed: ${message}`)
      return NextResponse.json({ error: "Admin functionality is not available", details: message }, { status: 503 })
    }

    // Initialize Supabase
    const supabase = createServerSupabaseClient()

    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the user is an admin
    const { isAdmin, reason } = isAdminEmail(session.user.email)

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden", reason }, { status: 403 })
    }

    // Parse request body
    const body = await req.json()
    const { subject, message: content, type, recipients } = body

    // Validate required fields
    if (!subject || !content) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 })
    }

    // Get target users based on recipients filter
    let userQuery = supabase.from("profiles").select("id, email, name")

    if (recipients === "active") {
      // In a real app, you'd have a way to filter active users
      userQuery = userQuery.eq("is_active", true)
    } else if (recipients === "inactive") {
      // In a real app, you'd have a way to filter inactive users
      userQuery = userQuery.eq("is_active", false)
    } else if (recipients === "premium") {
      // In a real app, you'd have a way to filter premium users
      userQuery = userQuery.eq("is_premium", true)
    }

    const { data: users, error: usersError } = await userQuery

    if (usersError) {
      console.error("Error fetching users for notification:", usersError)
      return NextResponse.json({ error: "Failed to fetch users for notification" }, { status: 500 })
    }

    // In a real app, you would send actual notifications here
    // This is a simplified example that just logs the action

    // Create a notification record in the database
    const { data: notification, error: notificationError } = await supabase
      .from("notifications")
      .insert({
        subject,
        content,
        type,
        recipients_type: recipients,
        recipients_count: users.length,
        sent_by: session.user.id,
        created_at: new Date().toISOString(),
      })
      .select()

    if (notificationError) {
      console.error("Error creating notification record:", notificationError)
      return NextResponse.json({ error: "Failed to create notification record" }, { status: 500 })
    }

    // Log the admin action
    await logAdminAction(
      "send_notification",
      {
        subject,
        type,
        recipients,
        recipients_count: users.length,
      },
      session.user.id,
    )

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${users.length} users`,
    })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 })
  }
}
