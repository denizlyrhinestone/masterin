import { createClient } from "@/lib/supabase"
import { cookies } from "next/headers"

export type User = {
  id: string
  email: string
  name?: string
  avatar_url?: string
  role?: "user" | "admin"
}

export type Session = {
  user: User | null
  expires: string
}

export const auth = {
  getSession: async (): Promise<Session | null> => {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error || !session) {
        return null
      }

      const user: User = {
        id: session.user.id,
        email: session.user.email || "",
        name: session.user.user_metadata?.name,
        avatar_url: session.user.user_metadata?.avatar_url,
        role: session.user.user_metadata?.role || "user",
      }

      return {
        user,
        expires: session.expires_at.toString(),
      }
    } catch (error) {
      console.error("Error getting session:", error)
      return null
    }
  },

  signIn: async (email: string, password: string) => {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  },

  signUp: async (email: string, password: string, metadata?: { name?: string }) => {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  },

  signOut: async () => {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }

    return true
  },

  resetPassword: async (email: string) => {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password`,
    })

    if (error) {
      throw new Error(error.message)
    }

    return true
  },

  updatePassword: async (password: string) => {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    return true
  },
}
