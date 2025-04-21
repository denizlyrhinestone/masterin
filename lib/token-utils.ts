import { createHash } from "crypto"

// Token expiration time in seconds (default: 24 hours)
const TOKEN_EXPIRATION = 24 * 60 * 60

export function generateVerificationToken(email: string): { token: string; expiresAt: Date } {
  // Create a hash of the email and current timestamp
  const timestamp = Date.now()
  const data = `${email}:${timestamp}`
  const token = createHash("sha256").update(data).digest("hex")

  // Set expiration date
  const expiresAt = new Date(timestamp + TOKEN_EXPIRATION * 1000)

  return { token, expiresAt }
}

export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > new Date(expiresAt)
}
