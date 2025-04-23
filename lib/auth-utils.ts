import { supabase } from "./supabase"

/**
 * Client-side utility to check if a user is authenticated
 * Safe to use in both App Router and Pages Router
 */
export async function checkUserAuthentication() {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Auth error:", error)
      return { isAuthenticated: false, user: null, error }
    }

    return {
      isAuthenticated: !!data.session,
      user: data.session?.user || null,
      error: null,
    }
  } catch (error) {
    console.error("Unexpected auth error:", error)
    return { isAuthenticated: false, user: null, error }
  }
}

/**
 * Client-side utility to get user profile data
 * Safe to use in both App Router and Pages Router
 */
export async function getUserProfile(userId: string) {
  if (!userId) return null

  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Profile fetch error:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Unexpected profile fetch error:", error)
    return null
  }
}
