import { NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"
import { isAdminEmail, checkAdminEmailConfig } from "@/lib/admin"

export async function GET() {
  try {
    // Check admin configuration
    const adminConfig = checkAdminEmailConfig()

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

    // Check database status
    let databaseStatus = "offline"
    let databaseResponseTime = 0

    const startTime = Date.now()
    try {
      const { data, error } = await supabaseAdmin.from("profiles").select("count").limit(1)

      if (error) {
        databaseStatus = "degraded"
      } else {
        databaseStatus = "online"
      }

      databaseResponseTime = Date.now() - startTime
    } catch (error) {
      console.error("Database check error:", error)
      databaseStatus = "offline"
    }

    // Check auth status
    let authStatus = "offline"
    let activeUsers = 0

    try {
      // This is a simplified check - in a real app, you'd have a more robust way to check auth service
      const { data, error } = await supabaseAdmin.auth.getSession()

      if (error) {
        authStatus = "degraded"
      } else {
        authStatus = "online"

        // Get active users count (users with sessions in the last 24 hours)
        // This is a simplified example - in a real app, you'd track this differently
        const { count } = await supabaseAdmin.rpc("get_active_users_count")
        activeUsers = count || 0
      }
    } catch (error) {
      console.error("Auth check error:", error)
      authStatus = "offline"
    }

    // Check storage status
    let storageStatus = "offline"
    let usedSpace = 0
    let totalSpace = 1024 * 1024 * 1024 // 1GB default

    try {
      // This is a simplified check - in a real app, you'd have a more robust way to check storage
      const { data, error } = await supabaseAdmin.storage.getBucket("avatars")

      if (error) {
        storageStatus = "degraded"
      } else {
        storageStatus = "online"

        // These values would come from actual storage metrics in a real app
        usedSpace = 1024 * 1024 * 50 // 50MB example
        totalSpace = 1024 * 1024 * 1024 // 1GB example
      }
    } catch (error) {
      console.error("Storage check error:", error)
      storageStatus = "offline"
    }

    // Return system status
    return NextResponse.json({
      database: {
        status: databaseStatus,
        responseTime: databaseResponseTime,
      },
      auth: {
        status: authStatus,
        activeUsers,
      },
      storage: {
        status: storageStatus,
        usedSpace,
        totalSpace,
      },
      adminConfig: {
        isConfigured: adminConfig.isConfigured,
        email: adminConfig.isConfigured ? process.env.ADMIN_EMAIL : null,
        message: adminConfig.message,
      },
    })
  } catch (error) {
    console.error("Error fetching system status:", error)
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 })
  }
}
