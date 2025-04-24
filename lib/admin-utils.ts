import { ADMIN_EMAIL } from "./env-config"

/**
 * Utility function to check if an email matches the admin email
 * @param email The email to check
 * @returns Boolean indicating if the email is the admin email
 */
export function isAdminUser(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
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
