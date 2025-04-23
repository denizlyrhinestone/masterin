import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { isAdminEmail, checkAdminEmailConfig, logAdminAction } from "@/lib/admin"

export async function POST(req: Request) {
  try {
    // Check if admin email is configured
    const { isConfigured, message } = checkAdminEmailConfig()
    if (!isConfigured) {
      console.error(`Admin check failed: ${message}`)
      return NextResponse.json({ error: "Admin functionality is not available", details: message }, { status: 503 })
    }

    // Get session using the client-side method
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !sessionData.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = sessionData.session

    // Parse request body
    const body = await req.json()
    const { userId } = body

    // Verify that the user ID in the request matches the authenticated user
    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if the user is an admin
    const { isAdmin, reason } = isAdminEmail(session.user.email)

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden", reason }, { status: 403 })
    }

    // Log successful admin authentication
    await logAdminAction("admin_authentication", { method: "check-admin" }, session.user.id)

    return NextResponse.json({ isAdmin: true })
  } catch (error) {
    console.error("Error checking admin status:", error)
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 })
  }
}
