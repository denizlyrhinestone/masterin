// Remove any dynamic route references
import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Add the missing named export
export const auth = {
  signIn,
  signUp,
  signOut,
  resetPassword,
  updatePassword,
  getCurrentUser,
  isAdmin,
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return { user: data.user, session: data.session }
  } catch (error) {
    console.error("Error signing in:", error)
    throw error
  }
}

export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return { user: data.user, session: data.session }
  } catch (error) {
    console.error("Error signing up:", error)
    throw error
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      throw error
    }
  } catch (error) {
    console.error("Error resetting password:", error)
    throw error
  }
}

export async function updatePassword(password: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      throw error
    }
  } catch (error) {
    console.error("Error updating password:", error)
    throw error
  }
}

export async function getCurrentUser() {
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

export async function isAdmin(user: any) {
  if (!user) return false

  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return false

  return user.email === adminEmail
}
