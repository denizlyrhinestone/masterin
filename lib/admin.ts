import { supabaseAdmin } from "./supabase"

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
 * Server-side function to check if the current user is an admin
 * This version uses the admin client directly and doesn't rely on next/headers
 * @param sessionData Optional session data to use instead of fetching
 * @returns Promise resolving to AdminCheckResult
 */
export async function checkCurrentUserIsAdmin(sessionData?: any): Promise<AdminCheckResult> {
  try {
    let session = sessionData

    if (!session) {
      // If no session provided, try to get it from the client
      const { data } = await supabaseAdmin.auth.getSession()
      session = data.session
    }

    if (!session) {
      return { isAdmin: false, reason: "User not authenticated" }
    }

    return isAdminEmail(session.user.email)
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
    // Use supabaseAdmin directly instead of createServerSupabaseClient
    const { error } = await supabaseAdmin.from("admin_logs").insert({
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
