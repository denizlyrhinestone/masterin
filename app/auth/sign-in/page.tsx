"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { type StandardError, validateEmail, createError, isErrorCode } from "@/lib/error-handling"
import { AuthError } from "@/components/auth-error"
import { RateLimitHandler } from "@/components/rate-limit-handler"
import { Checkbox } from "@/components/ui/checkbox"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: StandardError; password?: StandardError }>({})
  const [authError, setAuthError] = useState<StandardError | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { signIn, signInWithGoogle } = useAuth()

  const submitButtonRef = useRef<HTMLButtonElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)

  // Check for error parameters in the URL
  useEffect(() => {
    const errorType = searchParams.get("error")
    if (errorType) {
      switch (errorType) {
        case "auth_callback_failed":
          setAuthError(createError("unknown_error", "Authentication failed. Please try again."))
          break
        case "unexpected":
          setAuthError(createError("unknown_error", "An unexpected error occurred. Please try again."))
          break
        default:
          setAuthError(null)
      }
    }
  }, [searchParams])

  // Focus on error message when it appears
  useEffect(() => {
    if (authError && errorRef.current) {
      errorRef.current.focus()
    }
  }, [authError])

  // Focus on submit button after successful form reset
  useEffect(() => {
    if (!isLoading && submitButtonRef.current) {
      submitButtonRef.current.focus()
    }
  }, [isLoading])

  const validateForm = () => {
    const newErrors: { email?: StandardError; password?: StandardError } = {}

    // Email validation
    const emailError = validateEmail(email)
    if (emailError) {
      newErrors.email = emailError
    }

    // Password validation (simple required check for login)
    if (!password) {
      newErrors.password = createError("invalid_input", "Password is required", "password")
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
      const { error } = await signIn(email, password, rememberMe)

      if (error) {
        // Handle rate limiting separately
        if (isErrorCode(error, "too_many_requests")) {
          setAuthError(error)
          setIsLoading(false)
          return
        }

        setAuthError(error)
        setIsLoading(false)
        return
      }

      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      })

      // Get redirect URL from query params or default to home
      const redirectTo = searchParams.get("redirect") || "/"
      router.push(redirectTo)
    } catch (error) {
      console.error("Sign in error:", error)
      setAuthError(createError("unknown_error"))
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
        setAuthError(createError("unknown_error", "Failed to sign in with Google. Please try again."))
        setIsGoogleLoading(false)
      }

      // No need to redirect here as the OAuth flow will handle it
    } catch (error) {
      console.error("Unexpected error during Google sign in:", error)
      setAuthError(createError("unknown_error"))
      setIsGoogleLoading(false)
    }
  }

  const resetRateLimitError = () => {
    setAuthError(null)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in to your account</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authError && isErrorCode(authError, "too_many_requests") ? (
            <RateLimitHandler error={authError} resetAction={resetRateLimitError} />
          ) : (
            <div ref={errorRef} tabIndex={-1}>
              <AuthError error={authError} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Sign in form" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isGoogleLoading}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
                autoComplete="email"
                required
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-500" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || isGoogleLoading}
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  autoComplete="current-password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || isGoogleLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-red-500" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label
                htmlFor="remember-me"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full relative"
              disabled={isLoading || isGoogleLoading}
              aria-busy={isLoading}
              ref={submitButtonRef}
            >
              {isLoading ? (
                <>
                  <span className="opacity-0">Sign in</span>
                  <Loader2
                    className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-spin"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Signing in...</span>
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              className="flex items-center justify-center"
              aria-busy={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <>
                  <span className="opacity-0">Google</span>
                  <Loader2
                    className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 animate-spin"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Signing in with Google...</span>
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Google
                </>
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/auth/sign-up" className="text-purple-600 hover:text-purple-800 font-medium">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
