import { createClient } from "@supabase/supabase-js"

// Type for admin check result
export interface AdminCheckResult {
  isAdmin: boolean
  reason?: string
}

/**
 * Checks if the ADMIN_EMAIL environment variable is properly configured
 * @returns Object with status and optional error message
 */
export function checkAdminEmailConfig(): { isConfigured: boolean; message?: string } {
  const adminEmail = process.env.ADMIN_EMAIL

  if (!adminEmail) {
    return {
      isConfigured: false,
      message: "ADMIN_EMAIL environment variable is not set",
    }
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(adminEmail)) {
    return {
      isConfigured: false,
      message: "ADMIN_EMAIL environment variable contains an invalid email format",
    }
  }

  return { isConfigured: true }
}

/**
 * Checks if a user is an admin based on their email
 * @param userEmail The email to check
 * @returns AdminCheckResult with isAdmin status and optional reason
 */
export function isAdminEmail(userEmail: string | null | undefined): AdminCheckResult {
  if (!userEmail) {
    return { isAdmin: false, reason: "No user email provided" }
  }

  const { isConfigured, message } = checkAdminEmailConfig()
  if (!isConfigured) {
    console.error(`Admin check failed: ${message}`)
    return { isAdmin: false, reason: "Admin configuration error" }
  }

  const adminEmail = process.env.ADMIN_EMAIL
  const isAdmin = userEmail.toLowerCase() === adminEmail?.toLowerCase()

  return {
    isAdmin,
    reason: isAdmin ? undefined : "Email does not match admin email",
  }
}

/**
 * Creates a Supabase client for server-side operations
 * This avoids using next/headers which is not compatible with Pages Router
 */
export function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Server-side function to check if the current user is an admin
 * This version uses the service role key and doesn't rely on next/headers
 * @param userId The user ID to check
 * @returns Promise resolving to AdminCheckResult
 */
export async function checkUserIsAdmin(userId: string): Promise<AdminCheckResult> {
  try {
    if (!userId) {
      return { isAdmin: false, reason: "No user ID provided" }
    }

    const supabase = createAdminSupabaseClient()

    // Get the user's email
    const { data, error } = await supabase.from("profiles").select("email").eq("id", userId).single()

    if (error || !data) {
      return { isAdmin: false, reason: "User not found" }
    }

    return isAdminEmail(data.email)
  } catch (error) {
    console.error("Error checking admin status:", error)
    return { isAdmin: false, reason: "Error checking admin status" }
  }
}

/**
 * Logs an admin action for audit purposes
 * @param action The action being performed
 * @param details Additional details about the action
 * @param userId The ID of the user performing the action
 */
export async function logAdminAction(action: string, details: Record<string, any>, userId: string): Promise<void> {
  try {
    const supabase = createAdminSupabaseClient()

    // Log to admin_logs table
    const { error } = await supabase.from("admin_logs").insert({
      admin_id: userId,
      action,
      details,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error logging admin action:", error)
    }
  } catch (error) {
    console.error("Error in logAdminAction:", error)
  }
}
