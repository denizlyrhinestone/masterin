import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { isAdminEmail, checkAdminEmailConfig } from "@/lib/admin"
import { ADMIN_EMAIL } from "@/lib/env-config"

export async function GET() {
  try {
    // Check if admin email is configured
    const { isConfigured, message } = checkAdminEmailConfig()
    if (!isConfigured) {
      console.error(`Admin config check failed: ${message}`)
      return NextResponse.json({ error: "Admin functionality is not available", details: message }, { status: 503 })
    }

    // Get session using client-side method
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !sessionData.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = sessionData.session

    // Check if the user is an admin
    const { isAdmin, reason } = isAdminEmail(session.user.email)

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden", reason }, { status: 403 })
    }

    // Return admin configuration
    return NextResponse.json({
      email: ADMIN_EMAIL,
    })
  } catch (error) {
    console.error("Error fetching admin config:", error)
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 })
  }
}
