"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User, Session } from "@supabase/supabase-js"
import { supabase, getUserProfile, type UserProfile, type UserRole } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  isEducator: boolean
  isVerifiedEducator: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: any }>
  signUp: (
    email: string,
    password: string,
    userData: Partial<UserProfile>,
    isEducator?: boolean,
  ) => Promise<{ success: boolean; error?: any }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEducatorRole, setIsEducatorRole] = useState(false)
  const [isVerifiedEducatorStatus, setIsVerifiedEducatorStatus] = useState(false)
  const router = useRouter()

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)

      // Get the current session
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)

      if (session?.user) {
        setUser(session.user)
        const userProfile = await getUserProfile(session.user.id)
        setProfile(userProfile)

        // Check educator status
        if (userProfile) {
          setIsEducatorRole(userProfile.role === "educator")
          setIsVerifiedEducatorStatus(userProfile.role === "educator" && userProfile.educator_verified === true)
        }
      }

      setIsLoading(false)

      // Set up auth state change listener
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        setSession(session)
        setUser(session?.user || null)

        if (session?.user) {
          const userProfile = await getUserProfile(session.user.id)
          setProfile(userProfile)

          // Check educator status
          if (userProfile) {
            setIsEducatorRole(userProfile.role === "educator")
            setIsVerifiedEducatorStatus(userProfile.role === "educator" && userProfile.educator_verified === true)
          }
        } else {
          setProfile(null)
          setIsEducatorRole(false)
          setIsVerifiedEducatorStatus(false)
        }

        setIsLoading(false)
      })

      return () => {
        subscription.unsubscribe()
      }
    }

    initializeAuth()
  }, [])

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      setUser(data.user)
      setSession(data.session)

      if (data.user) {
        const userProfile = await getUserProfile(data.user.id)
        setProfile(userProfile)

        // Check educator status
        if (userProfile) {
          setIsEducatorRole(userProfile.role === "educator")
          setIsVerifiedEducatorStatus(userProfile.role === "educator" && userProfile.educator_verified === true)
        }
      }

      return { success: true }
    } catch (error) {
      console.error("Error signing in:", error)
      return { success: false, error }
    }
  }

  // Sign up function
  const signUp = async (email: string, password: string, userData: Partial<UserProfile>, isEducatorSignup = false) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Create user profile
        const profileData = {
          id: data.user.id,
          email,
          role: isEducatorSignup ? ("educator" as UserRole) : ("student" as UserRole),
          created_at: new Date().toISOString(),
          educator_verified: isEducatorSignup ? false : undefined, // Educators start unverified
          ...userData,
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .upsert(profileData)
          .select()
          .single()

        if (profileError) {
          console.error("Error creating profile:", profileError)
        } else {
          setProfile(profile as UserProfile)
          setIsEducatorRole(isEducatorSignup)
          setIsVerifiedEducatorStatus(false) // New educators are not verified
        }
      }

      return { success: true }
    } catch (error) {
      console.error("Error signing up:", error)
      return { success: false, error }
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setSession(null)
      setIsEducatorRole(false)
      setIsVerifiedEducatorStatus(false)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Refresh user profile
  const refreshProfile = async () => {
    if (user) {
      const userProfile = await getUserProfile(user.id)
      setProfile(userProfile)

      // Check educator status
      if (userProfile) {
        setIsEducatorRole(userProfile.role === "educator")
        setIsVerifiedEducatorStatus(userProfile.role === "educator" && userProfile.educator_verified === true)
      }
    }
  }

  const value = {
    user,
    profile,
    session,
    isLoading,
    isEducator: isEducatorRole,
    isVerifiedEducator: isVerifiedEducatorStatus,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
