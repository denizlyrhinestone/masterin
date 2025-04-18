import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Token expiration time in hours
const VERIFICATION_TOKEN_EXPIRY = 48

/**
 * Generate a verification token with expiration
 */
export async function generateVerificationToken(userId: string): Promise<string> {
  // Create a secure random token
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + VERIFICATION_TOKEN_EXPIRY)

  // Store the token in the database
  const { error } = await supabase.from("verification_tokens").insert({
    user_id: userId,
    token,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Error creating verification token:", error)
    throw new Error("Failed to create verification token")
  }

  return token
}

/**
 * Send verification email with the token
 */
export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
  try {
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`

    // In a real implementation, you would use an email service like SendGrid, Postmark, etc.
    // For now, we'll use Supabase's built-in email functionality
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: verificationUrl,
    })

    return !error
  } catch (error) {
    console.error("Error sending verification email:", error)
    return false
  }
}
