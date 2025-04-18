import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Token expiration time in hours
const VERIFICATION_TOKEN_EXPIRY = 48
const REMINDER_MIN_DAYS = 1
const REMINDER_MAX_DAYS = 7
const MAX_VERIFICATION_ATTEMPTS = 5

/**
 * Generate a secure, random verification token with expiration
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
    token_type: "email_verification",
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

/**
 * Verify a token and check if it's expired
 */
export async function verifyEmailToken(token: string): Promise<{
  valid: boolean
  expired: boolean
  userId?: string
  email?: string
  alreadyUsed?: boolean
}> {
  // Get the token from the database
  const { data, error } = await supabase.from("verification_tokens").select("*").eq("token", token).single()

  if (error || !data) {
    return { valid: false, expired: false }
  }

  // Check if token is expired
  const expiresAt = new Date(data.expires_at)
  const now = new Date()

  if (now > expiresAt) {
    return { valid: false, expired: true, userId: data.user_id }
  }

  // Check if token is already used
  if (data.used) {
    return { valid: false, expired: false, userId: data.user_id, alreadyUsed: true }
  }

  // Token is valid and not expired
  return { valid: true, expired: false, userId: data.user_id }
}

/**
 * Consume a verification token (mark as used)
 */
export async function consumeVerificationToken(token: string): Promise<boolean> {
  const { error } = await supabase.from("verification_tokens").update({ used: true }).eq("token", token)

  return !error
}

/**
 * Check if a user's email is verified
 */
export async function updateEmailVerificationStatus(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ email_verified: true, updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (error) {
      console.error("Error updating email verification status:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in updateEmailVerificationStatus:", error)
    return false
  }
}

/**
 * Increment verification attempts
 */
export async function incrementVerificationAttempts(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ verification_attempts: () => "verification_attempts + 1", updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (error) {
      console.error("Error incrementing verification attempts:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in incrementVerificationAttempts:", error)
    return false
  }
}

/**
 * Check if a user has exceeded the maximum number of verification attempts
 */
export async function checkVerificationAttempts(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("profiles").select("verification_attempts").eq("id", userId).single()

    if (error) {
      console.error("Error checking verification attempts:", error)
      return false
    }

    return data?.verification_attempts >= MAX_VERIFICATION_ATTEMPTS
  } catch (error) {
    console.error("Error in checkVerificationAttempts:", error)
    return false
  }
}

/**
 * Get users who need verification reminders
 */
export async function getUsersNeedingReminders(): Promise<any[]> {
  try {
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - REMINDER_MIN_DAYS)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - REMINDER_MAX_DAYS)

    const { data, error } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email_verified", false)
      .lt("created_at", oneDayAgo.toISOString())
      .gt("created_at", sevenDaysAgo.toISOString())

    if (error) {
      console.error("Error fetching unverified users:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getUsersNeedingReminders:", error)
    return []
  }
}
