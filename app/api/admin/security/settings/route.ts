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
    const settings = await req.json()

    // Validate settings
    if (settings.passwordMinLength < 6) {
      return NextResponse.json({ error: "Password minimum length must be at least 6 characters" }, { status: 400 })
    }

    if (settings.loginAttemptsLimit < 1) {
      return NextResponse.json({ error: "Login attempts limit must be at least 1" }, { status: 400 })
    }

    if (settings.sessionTimeout < 1) {
      return NextResponse.json({ error: "Session timeout must be at least 1 hour" }, { status: 400 })
    }

    // In a real app, you would save these settings to a database
    // This is a simplified example that just logs the action

    // Create or update security settings in the database
    const { data, error } = await supabase.from("security_settings").upsert({
      id: 1, // Single record for app-wide settings
      two_factor_required: settings.twoFactorRequired,
      password_min_length: settings.passwordMinLength,
      password_require_special: settings.passwordRequireSpecial,
      login_attempts_limit: settings.loginAttemptsLimit,
      session_timeout_hours: settings.sessionTimeout,
      updated_by: session.user.id,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error saving security settings:", error)
      return NextResponse.json({ error: "Failed to save security settings" }, { status: 500 })
    }

    // Log the admin action
    await logAdminAction("update_security_settings", settings, session.user.id)

    return NextResponse.json({
      success: true,
      message: "Security settings saved successfully",
    })
  } catch (error) {
    console.error("Error saving security settings:", error)
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 })
  }
}
