"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { Session, User } from "@supabase/supabase-js"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { type StandardError, standardizeSupabaseError, createError } from "@/lib/error-handling"

// Constants for token refresh
const TOKEN_REFRESH_MARGIN = 5 * 60 * 1000 // 5 minutes before expiry
const MAX_REFRESH_INTERVAL = 60 * 60 * 1000 // 1 hour maximum interval

interface UserProfile {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  isAdmin?: boolean
}

interface AuthContextType {
  user: UserProfile | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: StandardError | null }>
  signInWithGoogle: () => Promise<{ error: StandardError | null }>
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error: StandardError | null; userId: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: StandardError | null }>
  updatePassword: (password: string) => Promise<{ error: StandardError | null }>
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>
  checkAdminStatus: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false,
  signIn: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signUp: async () => ({ error: null, userId: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
  updateProfile: async () => ({ error: null }),
  checkAdminStatus: async () => false,
})

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [announcement, setAnnouncement] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  // Function to check if user is admin
  const checkAdminStatus = useCallback(async (): Promise<boolean> => {
    try {
      if (!user?.email) return false

      // Call the server API to check admin status
      const response = await fetch("/api/check-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies/auth
      })

      if (!response.ok) return false

      const data = await response.json()
      return !!data.isAdmin
    } catch (error) {
      console.error("Error checking admin status:", error)
      return false
    }
  }, [user?.email])

  // Function to fetch user profile from Supabase
  const fetchUserProfile = useCallback(async (userId: string) => {
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
  }, [])

  // Function to create user profile if it doesn't exist
  const createUserProfile = useCallback(async (user: User) => {
    try {
      // Check if profile already exists to prevent duplicate inserts
      const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", user.id).single()

      if (existingProfile) {
        return // Profile already exists
      }

      // Get user name from metadata or email
      const userName = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0] || null
      const userAvatar = user.user_metadata?.avatar_url || null

      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        name: userName,
        avatar_url: userAvatar,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error creating profile:", error)
      }
    } catch (error) {
      console.error("Error in createUserProfile:", error)
    }
  }, [])

  // Function to update user state based on session
  const updateUserState = useCallback(
    async (currentSession: Session | null) => {
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
              name: currentSession.user.user_metadata?.name || currentSession.user.user_metadata?.full_name || null,
              avatar_url: currentSession.user.user_metadata?.avatar_url || null,
            })

            // Create profile in the database if it doesn't exist
            if (currentSession.user.email) {
              await createUserProfile(currentSession.user)
            }
          }
          setIsAuthenticated(true)

          // Check admin status after setting user
          const adminStatus = await checkAdminStatus()
          setIsAdmin(adminStatus)
        } else {
          setUser(null)
          setIsAuthenticated(false)
          setIsAdmin(false)
        }
      } catch (error) {
        console.error("Error in updateUserState:", error)
        setUser(null)
        setIsAuthenticated(false)
        setIsAdmin(false)
      }
    },
    [fetchUserProfile, createUserProfile, checkAdminStatus],
  )

  // Improved token refresh function that calculates optimal refresh time
  const scheduleTokenRefresh = useCallback(async (currentSession: Session | null) => {
    if (!currentSession) return null

    try {
      // Calculate when the token expires
      const expiresAt = currentSession.expires_at ? currentSession.expires_at * 1000 : null
      const now = Date.now()

      // If we don't have an expiration time, use default refresh interval
      if (!expiresAt) return setTimeout(() => supabase.auth.refreshSession(), MAX_REFRESH_INTERVAL)

      // Calculate time until expiry with a safety margin
      const timeUntilExpiry = Math.max(0, expiresAt - now - TOKEN_REFRESH_MARGIN)

      // Cap the refresh interval to avoid very long timeouts
      const refreshInterval = Math.min(timeUntilExpiry, MAX_REFRESH_INTERVAL)

      // If token is already expired or about to expire, refresh immediately
      if (timeUntilExpiry <= 1000) {
        await supabase.auth.refreshSession()
        return null
      }

      // Schedule the refresh
      return setTimeout(async () => {
        try {
          await supabase.auth.refreshSession()
        } catch (error) {
          console.error("Error refreshing token:", error)
        }
      }, refreshInterval)
    } catch (error) {
      console.error("Error in scheduleTokenRefresh:", error)
      return null
    }
  }, [])

  useEffect(() => {
    let mounted = true
    let refreshTimer: ReturnType<typeof setTimeout> | null = null

    // Set up auth state listener
    const setupAuthListener = async () => {
      const { data } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (!mounted) return

        console.log("Auth state changed:", event)
        setSession(currentSession)

        if (event === "SIGNED_OUT") {
          setUser(null)
          setIsAuthenticated(false)
          setIsAdmin(false)
          setAnnouncement("You have been signed out.")

          // Add a small delay before redirecting to allow the announcement to be read
          setTimeout(() => {
            router.push("/auth/sign-in")
          }, 1500)
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          await updateUserState(currentSession)
          if (event === "SIGNED_IN") {
            setAnnouncement("You have been signed in successfully.")
          }
        }

        setIsLoading(false)
      })

      return data.subscription
    }

    // Initial session check
    const initializeAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession()

        if (!mounted) return

        setSession(initialSession)
        await updateUserState(initialSession)

        // Set up token refresh
        if (initialSession) {
          refreshTimer = await scheduleTokenRefresh(initialSession)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    const subscription = setupAuthListener()
    initializeAuth()

    // Clean up on unmount
    return () => {
      mounted = false
      if (refreshTimer) clearTimeout(refreshTimer)
      subscription.then((sub) => sub.unsubscribe())
    }
  }, [router, updateUserState, scheduleTokenRefresh])

  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      // Validate inputs
      if (!email || !password) {
        return {
          error: createError("invalid_input", "Email and password are required"),
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // Set session duration based on rememberMe
          expiresIn: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day
        },
      })

      if (error) {
        console.error("Sign in error:", error.message)
        return { error: standardizeSupabaseError(error) }
      }

      setAnnouncement("Signed in successfully. Welcome back!")
      return { error: null }
    } catch (error) {
      console.error("Unexpected error during sign in:", error)
      setAnnouncement("An unexpected error occurred during sign in.")
      return { error: createError("unknown_error") }
    }
  }

  const signInWithGoogle = async () => {
    try {
      // Get the current URL for the redirect
      const origin = typeof window !== "undefined" ? window.location.origin : ""
      const redirectTo = `${origin}/auth/callback`

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        console.error("Google sign in error:", error.message)
        return { error: standardizeSupabaseError(error) }
      }

      return { error: null }
    } catch (error) {
      console.error("Unexpected error during Google sign in:", error)
      return { error: createError("unknown_error", "An unexpected error occurred during Google sign in") }
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Validate inputs
      if (!email || !password || !name) {
        return {
          error: createError("invalid_input", "Email, password, and name are required"),
          userId: null,
        }
      }

      // Password strength validation
      if (password.length < 8) {
        return {
          error: createError("weak_password", "Password must be at least 8 characters long"),
          userId: null,
        }
      }

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
        return { error: standardizeSupabaseError(error), userId: null }
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

        setAnnouncement("Account created successfully. Please check your email to verify your account.")
      }

      return { error: null, userId: data.user?.id || null }
    } catch (error) {
      console.error("Unexpected error during sign up:", error)
      return { error: createError("unknown_error"), userId: null }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setAnnouncement("You have been signed out successfully.")
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
      if (!email) {
        return { error: createError("invalid_input", "Email is required") }
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        console.error("Reset password error:", error.message)
        return { error: standardizeSupabaseError(error) }
      }

      setAnnouncement("Password reset email sent. Please check your inbox.")
      return { error: null }
    } catch (error) {
      console.error("Unexpected error during password reset:", error)
      return { error: createError("unknown_error") }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      if (!password) {
        return { error: createError("invalid_input", "Password is required") }
      }

      // Password strength validation
      if (password.length < 8) {
        return {
          error: createError("weak_password", "Password must be at least 8 characters long"),
        }
      }

      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        console.error("Update password error:", error.message)
        return { error: standardizeSupabaseError(error) }
      }

      setAnnouncement("Your password has been updated successfully.")
      return { error: null }
    } catch (error) {
      console.error("Unexpected error during password update:", error)
      return { error: createError("unknown_error") }
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
      setAnnouncement("Your profile has been updated successfully.")

      return { error: null }
    } catch (error) {
      console.error("Error updating profile:", error)
      return { error: error as Error }
    }
  }

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      session,
      isAuthenticated,
      isLoading,
      isAdmin,
      signIn,
      signInWithGoogle,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      updateProfile,
      checkAdminStatus,
    }),
    [user, session, isAuthenticated, isLoading, isAdmin, checkAdminStatus],
  )

  return (
    <AuthContext.Provider value={contextValue}>
      {/* Accessibility: Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
