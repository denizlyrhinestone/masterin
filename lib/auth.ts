import { createClient } from "@supabase/supabase-js"
import type { User, Session } from "@supabase/supabase-js"

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

// Function to sign up a new user
export async function signUp(email: string, password: string, userData: Partial<UserProfile>, isEducator = false) {
  try {
    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
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

// Function to check if a user is an educator
export async function isEducator(userId: string): Promise<boolean> {
  try {
    const profile = await getUserProfile(userId)
    return profile?.role === "educator"
  } catch (error) {
    console.error("Error checking educator status:", error)
    return false
  }
}

// Function to check if an educator is verified
export async function isVerifiedEducator(userId: string): Promise<boolean> {
  try {
    const profile = await getUserProfile(userId)
    return profile?.role === "educator" && profile?.educator_verified === true
  } catch (error) {
    console.error("Error checking educator verification status:", error)
    return false
  }
}

// Function to request educator verification
export async function requestEducatorVerification(userId: string, verificationData: any): Promise<boolean> {
  try {
    // In a real app, this would send an email or create a verification request record
    // For now, we'll just update the profile with the verification data
    const { data, error } = await supabase
      .from("educator_verification_requests")
      .insert({
        user_id: userId,
        verification_data: verificationData,
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Error requesting verification:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in requestEducatorVerification:", error)
    return false
  }
}
