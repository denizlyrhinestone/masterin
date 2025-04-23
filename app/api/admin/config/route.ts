import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { isAdminEmail, checkAdminEmailConfig } from "@/lib/admin"

export async function GET() {
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

    // Return admin configuration
    return NextResponse.json({
      email: process.env.ADMIN_EMAIL,
    })
  } catch (error) {
    console.error("Error fetching admin config:", error)
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 })
  }
}
