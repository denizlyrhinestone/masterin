"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User, Session } from "@supabase/supabase-js"
import { supabaseAuth } from "@/lib/supabase-auth"
import { toast } from "@/components/ui/use-toast"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

interface AuthContextType {
  user: User | null
  session: Session | null
  status: AuthStatus
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>
  signUpWithEmail: (email: string, password: string, userData?: any) => Promise<{ error: any; data: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (password: string) => Promise<{ error: any }>
  updateProfile: (data: any) => Promise<{ error: any }>
  sendVerificationEmail: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  status: "loading",
  signInWithEmail: async () => ({ error: null }),
  signUpWithEmail: async () => ({ error: null, data: null }),
  signInWithGoogle: async () => ({ error: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
  updateProfile: async () => ({ error: null }),
  sendVerificationEmail: async () => ({ error: null }),
})

// Helper to get the site URL
const getSiteUrl = () => {
  // For client-side, use window.location.origin
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  // Fallback for server-side
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<AuthStatus>("loading")
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseAuth.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setStatus(session ? "authenticated" : "unauthenticated")
    })

    // Get initial session
    supabaseAuth.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setStatus(session ? "authenticated" : "unauthenticated")
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabaseAuth.auth.signInWithPassword({ email, password })
      if (error) {
        console.error("Sign in error:", error)
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        })
      }
      return { error }
    } catch (err: any) {
      console.error("Unexpected sign in error:", err)
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return { error: err }
    }
  }

  const signUpWithEmail = async (email: string, password: string, userData = {}) => {
    try {
      const siteUrl = getSiteUrl()
      console.log("Using site URL for redirects:", siteUrl)

      const { data, error } = await supabaseAuth.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${siteUrl}/auth/callback`,
        },
      })

      if (error) {
        console.error("Sign up error:", error)
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        })
      } else if (data?.user) {
        toast({
          title: "Verification email sent",
          description: "Please check your email to verify your account.",
        })
      }

      return { data, error }
    } catch (err: any) {
      console.error("Unexpected sign up error:", err)
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return { data: null, error: err }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const siteUrl = getSiteUrl()
      console.log("Using site URL for Google redirect:", siteUrl)

      const { error } = await supabaseAuth.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${siteUrl}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        console.error("Google sign-in error:", error)

        // Handle the specific "provider not enabled" error
        if (error.message.includes("provider is not enabled")) {
          toast({
            title: "Google sign-in not available",
            description: "Google authentication is not properly configured. Please contact the administrator.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Google sign-in failed",
            description: error.message,
            variant: "destructive",
          })
        }
      }

      return { error }
    } catch (error: any) {
      console.error("Unexpected Google sign-in error:", error)
      toast({
        title: "Google sign-in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return { error }
    }
  }

  const signOut = async () => {
    try {
      await supabaseAuth.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const siteUrl = getSiteUrl()
      const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/reset-password`,
      })

      if (error) {
        console.error("Reset password error:", error)
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Password reset email sent",
          description: "Please check your email for password reset instructions.",
        })
      }

      return { error }
    } catch (err: any) {
      console.error("Unexpected reset password error:", err)
      toast({
        title: "Password reset failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return { error: err }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabaseAuth.auth.updateUser({ password })

      if (error) {
        console.error("Update password error:", error)
        toast({
          title: "Password update failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Password updated",
          description: "Your password has been successfully updated.",
        })
      }

      return { error }
    } catch (err: any) {
      console.error("Unexpected update password error:", err)
      toast({
        title: "Password update failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return { error: err }
    }
  }

  const updateProfile = async (data: any) => {
    try {
      const { error } = await supabaseAuth.auth.updateUser({ data })

      if (error) {
        console.error("Update profile error:", error)
        toast({
          title: "Profile update failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        })
      }

      return { error }
    } catch (err: any) {
      console.error("Unexpected update profile error:", err)
      toast({
        title: "Profile update failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return { error: err }
    }
  }

  const sendVerificationEmail = async (email: string) => {
    try {
      const siteUrl = getSiteUrl()
      const { error } = await supabaseAuth.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${siteUrl}/auth/verify`,
        },
      })

      if (error) {
        console.error("Verification email error:", error)
        toast({
          title: "Verification email failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Verification email sent",
          description: "Please check your email to verify your account.",
        })
      }

      return { error }
    } catch (err: any) {
      console.error("Unexpected verification email error:", err)
      toast({
        title: "Verification email failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      return { error: err }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        status,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        sendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
