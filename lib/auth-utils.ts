import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

// Initialize the Supabase client
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
    // Create the verification URL with the token
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`

    // Get user information to personalize the email
    const { data: userData } = await supabase.from("profiles").select("full_name").eq("email", email).single()

    const userName = userData?.full_name || "there"

    // In a real-world application, you would use a proper email service
    // like SendGrid, Postmark, AWS SES, etc. with HTML templates.
    // For demonstration, we're using Supabase's auth email functionality
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: verificationUrl,
    })

    // In a production app, you would use a proper email service with HTML templates
    // Example with a service like SendGrid or similar:
    /*
    await emailService.send({
      to: email,
      subject: 'Verify your Masterin account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f0f7ff; padding: 20px; text-align: center;">
            <h1 style="color: #0066cc;">Masterin</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Verify Your Email Address</h2>
            <p>Hi ${userName},</p>
            <p>Thanks for signing up for Masterin! Please verify your email address by clicking the button below.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #0066cc; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            <p>This verification link will expire in ${VERIFICATION_TOKEN_EXPIRY} hours.</p>
            <p>If you didn't create an account with us, you can safely ignore this email.</p>
            <p>Best regards,<br>The Masterin Team</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>© ${new Date().getFullYear()} Masterin Education. All rights reserved.</p>
          </div>
        </div>
      `
    })
    */

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
  alreadyUsed: boolean
  userId?: string
  email?: string
}> {
  try {
    // Get the token from the database
    const { data, error } = await supabase
      .from("verification_tokens")
      .select("*")
      .eq("token", token)
      .eq("token_type", "email_verification")
      .single()

    if (error || !data) {
      return { valid: false, expired: false, alreadyUsed: false }
    }

    // Check if token is already used
    if (data.used) {
      // Get user email for better error message
      const { data: userData } = await supabase.from("profiles").select("email").eq("id", data.user_id).single()

      return {
        valid: false,
        expired: false,
        alreadyUsed: true,
        userId: data.user_id,
        email: userData?.email,
      }
    }

    // Check if token is expired
    const expiresAt = new Date(data.expires_at)
    const now = new Date()

    if (now > expiresAt) {
      // Get user email for better error message
      const { data: userData } = await supabase.from("profiles").select("email").eq("id", data.user_id).single()

      return {
        valid: false,
        expired: true,
        alreadyUsed: false,
        userId: data.user_id,
        email: userData?.email,
      }
    }

    // Get user email for success message
    const { data: userData } = await supabase.from("profiles").select("email").eq("id", data.user_id).single()

    // Token is valid and not expired
    return {
      valid: true,
      expired: false,
      alreadyUsed: false,
      userId: data.user_id,
      email: userData?.email,
    }
  } catch (error) {
    console.error("Error verifying token:", error)
    return { valid: false, expired: false, alreadyUsed: false }
  }
}

/**
 * Check if a user has exceeded maximum verification attempts
 */
export async function checkVerificationAttempts(userId: string): Promise<boolean> {
  try {
    // Get the user's verification attempts
    const { data, error } = await supabase.from("profiles").select("verification_attempts").eq("id", userId).single()

    if (error || !data) {
      return false
    }

    return data.verification_attempts >= MAX_VERIFICATION_ATTEMPTS
  } catch (error) {
    console.error("Error checking verification attempts:", error)
    return false
  }
}

/**
 * Increment a user's verification attempts
 */
export async function incrementVerificationAttempts(userId: string): Promise<void> {
  try {
    await supabase.rpc("increment_verification_attempts", {
      user_id: userId,
    })
  } catch (error) {
    console.error("Error incrementing verification attempts:", error)
  }
}

/**
 * Consume a verification token (mark as used)
 */
export async function consumeVerificationToken(token: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("verification_tokens")
      .update({
        used: true,
        used_at: new Date().toISOString(),
      })
      .eq("token", token)

    return !error
  } catch (error) {
    console.error("Error consuming token:", error)
    return false
  }
}

/**
 * Update a user's email verification status
 */
export async function updateEmailVerificationStatus(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        email_verified: true,
        updated_at: new Date().toISOString(),
        last_verified_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (!error) {
      // Record verification success
      await supabase.from("verification_activity").insert({
        user_id: userId,
        activity_type: "verification_success",
        created_at: new Date().toISOString(),
      })
    }

    return !error
  } catch (error) {
    console.error("Error updating email verification status:", error)
    return false
  }
}

/**
 * Get users who need verification reminders
 */
export async function getUsersNeedingReminders(): Promise<any[]> {
  const minDate = new Date()
  minDate.setDate(minDate.getDate() - REMINDER_MIN_DAYS)

  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() - REMINDER_MAX_DAYS)

  try {
    // Get users who registered between REMINDER_MIN_DAYS and REMINDER_MAX_DAYS ago
    // and haven't verified their email yet
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("email_verified", false)
      .lt("created_at", minDate.toISOString())
      .gt("created_at", maxDate.toISOString())
      .lt("verification_attempts", MAX_VERIFICATION_ATTEMPTS)

    if (error) {
      console.error("Error fetching users needing reminders:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getUsersNeedingReminders:", error)
    return []
  }
}
