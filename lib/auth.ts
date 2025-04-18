import { createClient } from "@supabase/supabase-js"
import type { User, Session } from "@supabase/supabase-js"
import crypto from "crypto"

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for user data
export type UserRole = "student" | "educator" | "admin"

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: UserRole
  grade_level?: string
  educator_bio?: string
  educator_title?: string
  educator_verified?: boolean
  email_verified: boolean
  created_at: string
  updated_at?: string
}

// Function to get user profile data
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching user profile:", error)
      return null
    }

    return data as UserProfile
  } catch (error) {
    console.error("Error in getUserProfile:", error)
    return null
  }
}

// Function to create or update user profile
export async function upsertUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    // Ensure we have an updated_at timestamp
    const profileWithTimestamp = {
      ...profile,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("profiles").upsert(profileWithTimestamp).select().single()

    if (error) {
      console.error("Error upserting user profile:", error)
      return null
    }

    return data as UserProfile
  } catch (error) {
    console.error("Error in upsertUserProfile:", error)
    return null
  }
}

// Function to sign up a new user with email verification
export async function signUp(email: string, password: string, userData: Partial<UserProfile>, isEducator = false) {
  try {
    // Create the user in Supabase Auth with email confirmation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
        data: {
          role: isEducator ? "educator" : "student",
        },
      },
    })

    if (authError) {
      throw authError
    }

    if (authData.user) {
      // Create the user profile
      const profile = {
        id: authData.user.id,
        email,
        role: isEducator ? ("educator" as const) : ("student" as const),
        created_at: new Date().toISOString(),
        educator_verified: isEducator ? false : undefined, // Educators start unverified
        email_verified: false, // Start with unverified email
        ...userData,
      }

      await upsertUserProfile(profile)
    }

    return { success: true, user: authData.user }
  } catch (error) {
    console.error("Error signing up:", error)
    return { success: false, error }
  }
}

// Function to sign in a user
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return { success: true, user: data.user, session: data.session }
  } catch (error) {
    console.error("Error signing in:", error)
    return { success: false, error }
  }
}

// Function to sign out a user
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Error signing out:", error)
    return { success: false, error }
  }
}

// Function to get the current session
export async function getSession(): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      throw error
    }

    return data.session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

// Function to get the current user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      throw error
    }

    return data.user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Function to check if a user's email is verified
export async function isEmailVerified(userId: string): Promise<boolean> {
  try {
    const profile = await getUserProfile(userId)
    return profile?.email_verified === true
  } catch (error) {
    console.error("Error checking email verification status:", error)
    return false
  }
}

// Function to update email verification status
export async function updateEmailVerificationStatus(userId: string, verified: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ email_verified: verified, updated_at: new Date().toISOString() })
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

// Function to resend verification email
export async function resendVerificationEmail(email: string): Promise<boolean> {
  try {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`,
      },
    })

    if (error) {
      console.error("Error resending verification email:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in resendVerificationEmail:", error)
    return false
  }
}

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
 * Verify a token and check if it's expired
 */
export async function verifyEmailToken(token: string): Promise<{
  valid: boolean
  expired: boolean
  userId?: string
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
