"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import type { Session } from "@supabase/supabase-js"
import { useToast } from "@/hooks/use-toast"

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
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null; userId: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updatePassword: (password: string) => Promise<{ error: Error | null }>
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

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession)
      setIsAuthenticated(!!currentSession)

      if (currentSession?.user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentSession.user.id)
          .single()

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
          if (error && currentSession.user.email) {
            await supabase.from("profiles").insert({
              id: currentSession.user.id,
              email: currentSession.user.email,
              name: currentSession.user.user_metadata?.name || null,
              avatar_url: null,
              updated_at: new Date().toISOString(),
            })
          }
        }
      } else {
        setUser(null)
      }

      setIsLoading(false)
    })

    // Initial session check
    const initializeAuth = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession()

      if (initialSession) {
        setSession(initialSession)
        setIsAuthenticated(true)

        const { data: profile } = await supabase.from("profiles").select("*").eq("id", initialSession.user.id).single()

        if (profile) {
          setUser({
            id: initialSession.user.id,
            email: initialSession.user.email || "",
            name: profile.name,
            avatar_url: profile.avatar_url,
          })
        } else {
          setUser({
            id: initialSession.user.id,
            email: initialSession.user.email || "",
            name: initialSession.user.user_metadata?.name || null,
            avatar_url: null,
          })
        }
      }

      setIsLoading(false)
    }

    initializeAuth()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error("Error signing in:", error)
      return { error: error as Error }
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

      if (error) throw error

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
      console.error("Error signing up:", error)
      return { error: error as Error, userId: null }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error("Error resetting password:", error)
      return { error: error as Error }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error("Error updating password:", error)
      return { error: error as Error }
    }
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error("User not authenticated") }
    }

    try {
      // Update auth metadata if name is provided
      if (data.name) {
        await supabase.auth.updateUser({
          data: { name: data.name },
        })
      }

      // Update profile in the database
      const { error } = await supabase
        .from("profiles")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

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
