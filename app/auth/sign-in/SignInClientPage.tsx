"use client"

import type React from "react"
import Link from "next/link"
import SignInForm from "@/components/auth/sign-in-form"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface SignInPageProps {
  searchParams: {
    callbackUrl?: string
    error?: string
  }
}

export default function SignInClientPage({ searchParams }: SignInPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [authError, setAuthError] = useState<string | null>(null)

  const router = useRouter()
  const { toast } = useToast()
  const { signIn, signInWithGoogle } = useAuth()

  // Check for error parameters in the URL
  useEffect(() => {
    const errorType = searchParams.error
    if (errorType) {
      switch (errorType) {
        case "auth_callback_failed":
          setAuthError("Authentication failed. Please try again.")
          break
        case "unexpected":
          setAuthError("An unexpected error occurred. Please try again.")
          break
        default:
          setAuthError(null)
      }
    }
  }, [searchParams.error])

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    // Email validation
    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setAuthError(null)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        if (error.code === "invalid_credentials") {
          setAuthError("The email or password you entered is incorrect.")
        } else if (error.code === "email_not_confirmed") {
          setAuthError("Please check your email and verify your account before signing in.")
        } else {
          setAuthError(error.message || "An error occurred during sign in. Please try again.")
        }
        setIsLoading(false)
        return
      }

      // The redirect is now handled in the auth context for both production and development
    } catch (error) {
      console.error("Sign in error:", error)
      setAuthError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setAuthError(null)

    try {
      const { error } = await signInWithGoogle()

      if (error) {
        console.error("Google sign in error:", error)
        setAuthError("Failed to sign in with Google. Please try again.")
        setIsGoogleLoading(false)
      }

      // The redirect is now handled in the auth context
    } catch (error) {
      console.error("Unexpected error during Google sign in:", error)
      setAuthError("An unexpected error occurred. Please try again.")
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign In</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your email and password to sign in to your account
          </p>
        </div>

        {searchParams.error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md text-sm">
            {searchParams.error === "CredentialsSignin"
              ? "Invalid email or password"
              : "An error occurred. Please try again."}
          </div>
        )}

        <SignInForm callbackUrl={searchParams.callbackUrl} />

        <p className="px-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link href="/auth/forgot-password" className="hover:text-brand underline underline-offset-4">
            Forgot your password?
          </Link>
        </p>

        <p className="px-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/auth/sign-up" className="hover:text-brand underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
