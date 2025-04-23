"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { Session, AuthError, User } from "@supabase/supabase-js"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
}

interface AuthContextType {
  user: UserProfile | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: AuthError | null; userId: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, userId: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
  updateProfile: async () => ({ error: null }),
})

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  // Function to fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching profile:", error)
        return null
      }

      return profile
    } catch (error) {
      console.error("Error in fetchUserProfile:", error)
      return null
    }
  }

  // Function to create user profile if it doesn't exist
  const createUserProfile = async (user: User) => {
    try {
      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || null,
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error creating profile:", error)
      }
    } catch (error) {
      console.error("Error in createUserProfile:", error)
    }
  }

  // Function to update user state based on session
  const updateUserState = async (currentSession: Session | null) => {
    try {
      if (currentSession?.user) {
        const profile = await fetchUserProfile(currentSession.user.id)

        if (profile) {
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email || "",
            name: profile.name,
            avatar_url: profile.avatar_url,
          })
        } else {
          // If no profile exists yet, create a basic one from auth data
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email || "",
            name: currentSession.user.user_metadata?.name || null,
            avatar_url: null,
          })

          // Create profile in the database if it doesn't exist
          if (currentSession.user.email) {
            await createUserProfile(currentSession.user)
          }
        }
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error("Error in updateUserState:", error)
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", event)
      setSession(currentSession)

      if (event === "SIGNED_OUT") {
        setUser(null)
        setIsAuthenticated(false)
        router.push("/auth/sign-in")
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        await updateUserState(currentSession)
      }

      setIsLoading(false)
    })

    // Initial session check
    const initializeAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession()

        setSession(initialSession)
        await updateUserState(initialSession)
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Set up refresh timer to prevent session expiration
    const refreshTimer = setInterval(
      async () => {
        try {
          const { data } = await supabase.auth.refreshSession()
          setSession(data.session)
        } catch (error) {
          console.error("Error refreshing session:", error)
        }
      },
      4 * 60 * 60 * 1000, // Refresh every 4 hours
    )

    // Clean up timer on unmount
    return () => {
      subscription.unsubscribe()
      clearInterval(refreshTimer)
    }
  }, [router])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Sign in error:", error.message)
        // Categorize common auth errors for better user feedback
        if (error.message.includes("Invalid login credentials")) {
          return { error: { ...error, code: "invalid_credentials" } as AuthError }
        } else if (error.message.includes("Email not confirmed")) {
          return { error: { ...error, code: "email_not_confirmed" } as AuthError }
        }
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error("Unexpected error during sign in:", error)
      return { error: new Error("An unexpected error occurred") as unknown as AuthError }
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) {
        console.error("Sign up error:", error.message)
        // Categorize common signup errors
        if (error.message.includes("already registered")) {
          return { error: { ...error, code: "email_in_use" }, userId: null }
        }
        return { error, userId: null }
      }

      // Create a profile record
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email,
          name,
          avatar_url: null,
          updated_at: new Date().toISOString(),
        })

        if (profileError) {
          console.error("Error creating profile:", profileError)
        }

        toast({
          title: "Verification email sent",
          description: "Please check your email to verify your account.",
        })
      }

      return { error: null, userId: data.user?.id || null }
    } catch (error) {
      console.error("Unexpected error during sign up:", error)
      return { error: new Error("An unexpected error occurred") as unknown as AuthError, userId: null }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      // Router navigation is handled by auth state change listener
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        console.error("Reset password error:", error.message)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error("Unexpected error during password reset:", error)
      return { error: new Error("An unexpected error occurred") as unknown as AuthError }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        console.error("Update password error:", error.message)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error("Unexpected error during password update:", error)
      return { error: new Error("An unexpected error occurred") as unknown as AuthError }
    }
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error("User not authenticated") }
    }

    try {
      // Update auth metadata if name is provided
      if (data.name) {
        const { error: authError } = await supabase.auth.updateUser({
          data: { name: data.name },
        })

        if (authError) {
          throw authError
        }
      }

      // Update profile in the database
      const { error } = await supabase
        .from("profiles")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        throw error
      }

      // Update local state
      setUser((prev) => (prev ? { ...prev, ...data } : null))

      return { error: null }
    } catch (error) {
      console.error("Error updating profile:", error)
      return { error: error as Error }
    }
  }

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}
