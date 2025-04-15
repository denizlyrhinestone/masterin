"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Mail, Lock, User, AlertCircle, Loader2, CheckCircle, Info } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword, sendVerificationEmail } = useAuth()

  // Form states
  const [activeTab, setActiveTab] = useState<string>("login")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false)
  const [showVerification, setShowVerification] = useState<boolean>(false)

  // Form data
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [fullName, setFullName] = useState<string>("")
  const [username, setUsername] = useState<string>("")

  // Status messages
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [warning, setWarning] = useState<string>("")

  // Check for redirects or actions from URL params
  useEffect(() => {
    const action = searchParams.get("action")
    if (action === "reset-password") {
      setShowForgotPassword(true)
      setActiveTab("login")
    } else if (action === "verify") {
      setShowVerification(true)
      setActiveTab("login")
    } else if (action === "signup") {
      setActiveTab("signup")
    }

    // Check for error in URL params
    const errorMsg = searchParams.get("error")
    if (errorMsg) {
      setError(decodeURIComponent(errorMsg))
    }
  }, [searchParams])

  const validateForm = () => {
    setError("")

    if (activeTab === "signup") {
      if (!fullName) return "Please enter your full name"
      if (!username) return "Please enter a username"
      if (password !== confirmPassword) return "Passwords do not match"
      if (password.length < 8) return "Password must be at least 8 characters"
    }

    if (!email) return "Please enter your email"
    if (!/\S+@\S+\.\S+/.test(email)) return "Please enter a valid email"
    if (!password && !showForgotPassword) return "Please enter your password"

    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const { error } = await signInWithEmail(email, password)
      if (error) {
        setError(error.message)
      } else {
        router.push("/dashboard")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const { error, data } = await signUpWithEmail(email, password, {
        full_name: fullName,
        username: username,
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess("Account created successfully! Please check your email to verify your account.")
        setShowVerification(true)
        setActiveTab("login")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during signup")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const { error } = await resetPassword(email)
      if (error) {
        setError(error.message)
      } else {
        setSuccess("Password reset link sent to your email")
        setShowForgotPassword(false)
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const { error } = await sendVerificationEmail(email)
      if (error) {
        setError(error.message)
      } else {
        setSuccess("Verification email sent")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true)
    setError("")
    setWarning("")

    try {
      if (provider === "google") {
        const { error } = await signInWithGoogle()

        if (error) {
          if (error.message.includes("provider is not enabled")) {
            setWarning("Google authentication is not properly configured. Please contact the administrator.")
            console.error("Google provider not enabled in Supabase. Check your Supabase configuration.")
          } else {
            setError(error.message || "Failed to sign in with Google")
          }
          setIsLoading(false)
        }
        // If successful, the page will redirect, so we don't need to handle success case here
      }
    } catch (err: any) {
      setError(err.message || `An error occurred during ${provider} login`)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Image Section - Hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-50 to-purple-50 relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-10">
          <div className="w-full max-w-md space-y-6">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-10 w-10 text-blue-600" />
              <span className="text-2xl font-bold">LearnWise</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Unlock your potential with expert-led courses
            </h1>
            <p className="text-muted-foreground">
              Join millions of learners worldwide and explore a new world of knowledge. Learn at your own pace, anytime,
              anywhere.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <div className="text-lg font-semibold text-blue-600">10K+</div>
                <div className="text-sm text-gray-500">Active Students</div>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <div className="text-lg font-semibold text-blue-600">500+</div>
                <div className="text-sm text-gray-500">Expert Courses</div>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <div className="text-lg font-semibold text-blue-600">98%</div>
                <div className="text-sm text-gray-500">Satisfaction Rate</div>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <div className="text-lg font-semibold text-blue-600">24/7</div>
                <div className="text-sm text-gray-500">Support Available</div>
              </div>
            </div>
          </div>
          <div className="mt-auto">
            <Image
              src="/placeholder.svg?height=400&width=500"
              alt="Students learning"
              width={500}
              height={400}
              className="rounded-lg object-cover shadow-lg"
              priority
            />
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-8">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            {/* Only show on mobile */}
            <div className="flex items-center justify-center space-x-2 md:hidden">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">LearnWise</span>
            </div>
            <h2 className="text-2xl font-bold">Welcome to LearnWise</h2>
            <p className="text-sm text-muted-foreground">
              {activeTab === "login" ? "Sign in to access your account" : "Create an account to get started"}
            </p>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <Alert variant="destructive" className="animate-in fade-in-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {warning && (
            <Alert className="bg-amber-50 text-amber-800 border-amber-200 animate-in fade-in-50">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription>{warning}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200 animate-in fade-in-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Forgot Password Form */}
          {showForgotPassword ? (
            <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-5">
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-semibold">Reset Your Password</h3>
                <p className="text-sm text-muted-foreground">
                  Enter your email address and we'll send you a link to reset your password
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgotPassword(false)}>
                  Back to Login
                </Button>
              </form>
            </div>
          ) : showVerification ? (
            <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-5">
              <div className="space-y-2 text-center">
                <h3 className="text-xl font-semibold">Verify Your Email</h3>
                <p className="text-sm text-muted-foreground">
                  Please check your email for a verification link. If you didn't receive it, you can request a new one.
                </p>
              </div>

              <form onSubmit={handleResendVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verify-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="verify-email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resending Verification...
                    </>
                  ) : (
                    "Resend Verification Email"
                  )}
                </Button>

                <Button type="button" variant="ghost" className="w-full" onClick={() => setShowVerification(false)}>
                  Back to Login
                </Button>
              </form>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-in fade-in-50">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-xs text-blue-600"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot Password?
                      </Button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => handleSocialLogin("google")}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      className="h-5 w-5"
                    >
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </div>
              </TabsContent>

              {/* Signup Form */}
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="full-name"
                        placeholder="John Doe"
                        className="pl-10"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        placeholder="johndoe"
                        className="pl-10"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Password must be at least 8 characters long</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => handleSocialLogin("google")}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      className="h-5 w-5"
                    >
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
