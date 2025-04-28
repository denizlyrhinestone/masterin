import { ADMIN_EMAIL } from "./env-config"

// Type for admin check result
export interface AdminCheckResult {
  isAdmin: boolean
  reason?: string
}

/**
 * Checks if a user is an admin based on their email
 * This function is safe to use on both client and server
 * @param userEmail The email to check
 * @returns AdminCheckResult with isAdmin status and optional reason
 */
export function isAdminEmail(userEmail: string | null | undefined): AdminCheckResult {
  if (!userEmail) {
    return { isAdmin: false, reason: "No user email provided" }
  }

  // We don't expose the admin email in the client
  // Instead, we just return a result based on the check
  const adminEmail = ADMIN_EMAIL

  if (!adminEmail) {
    console.error("Admin email not configured")
    return { isAdmin: false, reason: "Admin configuration error" }
  }

  const isAdmin = userEmail.toLowerCase() === adminEmail.toLowerCase()

  return {
    isAdmin,
    reason: isAdmin ? undefined : "Email does not match admin email",
  }
}

/**
 * Server-side function to check if the current user is an admin
 * This version should only be used in server components or API routes
 * @param email The user's email to check
 * @returns AdminCheckResult
 */
export function checkIsAdmin(email: string | null | undefined): AdminCheckResult {
  return isAdminEmail(email)
}

/**
 * Get the admin email with domain masked for display purposes
 * @returns Masked admin email (e.g., a****@masterin.org)
 */
export function getMaskedAdminEmail(): string {
  const [username, domain] = ADMIN_EMAIL.split("@")
  if (!username || !domain) return ADMIN_EMAIL

  const firstChar = username.charAt(0)
  const maskedUsername = firstChar + "*".repeat(username.length - 1)
  return `${maskedUsername}@${domain}`
}

/**
 * Verify that the admin email is properly configured
 * @returns Object with verification status and message
 */
export function verifyAdminConfig(): { valid: boolean; message: string } {
  if (!ADMIN_EMAIL) {
    return { valid: false, message: "Admin email is not configured" }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(ADMIN_EMAIL)) {
    return { valid: false, message: "Admin email format is invalid" }
  }

  return {
    valid: true,
    message: `Admin email is configured correctly as ${getMaskedAdminEmail()}`,
  }
}
