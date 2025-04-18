"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User, Session } from "@supabase/supabase-js"
import {
  supabase,
  getUserProfile,
  type UserProfile,
  type UserRole,
  resendVerificationEmail,
  updateEmailVerificationStatus,
} from "@/lib/auth"

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  isEducator: boolean
  isVerifiedEducator: boolean
  isEmailVerified: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: any }>
  signUp: (
    email: string,
    password: string,
    userData: Partial<UserProfile>,
    isEducator?: boolean,
  ) => Promise<{ success: boolean; error?: any }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  resendVerification: (email: string) => Promise<boolean>
  updateEmailVerification: (verified: boolean) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEducatorRole, setIsEducatorRole] = useState(false)
  const [isVerifiedEducatorStatus, setIsVerifiedEducatorStatus] = useState(false)
  const [isEmailVerifiedStatus, setIsEmailVerifiedStatus] = useState(false)
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

        // Check statuses
        if (userProfile) {
          setIsEducatorRole(userProfile.role === "educator")
          setIsVerifiedEducatorStatus(userProfile.role === "educator" && userProfile.educator_verified === true)
          setIsEmailVerifiedStatus(userProfile.email_verified === true)
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

          // Check statuses
          if (userProfile) {
            setIsEducatorRole(userProfile.role === "educator")
            setIsVerifiedEducatorStatus(userProfile.role === "educator" && userProfile.educator_verified === true)
            setIsEmailVerifiedStatus(userProfile.email_verified === true)
          }
        } else {
          setProfile(null)
          setIsEducatorRole(false)
          setIsVerifiedEducatorStatus(false)
          setIsEmailVerifiedStatus(false)
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

        // Check statuses
        if (userProfile) {
          setIsEducatorRole(userProfile.role === "educator")
          setIsVerifiedEducatorStatus(userProfile.role === "educator" && userProfile.educator_verified === true)
          setIsEmailVerifiedStatus(userProfile.email_verified === true)
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
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
          data: {
            role: isEducatorSignup ? "educator" : "student",
          },
        },
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
          email_verified: false, // Start with unverified email
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
          setIsEmailVerifiedStatus(false) // New users start with unverified email
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
      setIsEmailVerifiedStatus(false)
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

      // Check statuses
      if (userProfile) {
        setIsEducatorRole(userProfile.role === "educator")
        setIsVerifiedEducatorStatus(userProfile.role === "educator" && userProfile.educator_verified === true)
        setIsEmailVerifiedStatus(userProfile.email_verified === true)
      }
    }
  }

  // Resend verification email
  const resendVerification = async (email: string) => {
    return await resendVerificationEmail(email)
  }

  // Update email verification status
  const updateEmailVerification = async (verified: boolean) => {
    if (!user) return false

    const success = await updateEmailVerificationStatus(user.id, verified)

    if (success) {
      setIsEmailVerifiedStatus(verified)
      await refreshProfile()
    }

    return success
  }

  const value = {
    user,
    profile,
    session,
    isLoading,
    isEducator: isEducatorRole,
    isVerifiedEducator: isVerifiedEducatorStatus,
    isEmailVerified: isEmailVerifiedStatus,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    resendVerification,
    updateEmailVerification,
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
