"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Loader2 } from "lucide-react"
import { verifyUserEmail, resendVerificationEmail } from "@/app/actions/verification-actions"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { VerificationSuccessAnimation } from "@/components/verification-success-animation"
import { VerificationErrorGuidance } from "@/components/verification-error-guidance"
import { motion } from "framer-motion"

export default function VerifyEmailPage() {
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorType, setErrorType] = useState<
    "invalid" | "expired" | "already-verified" | "technical" | "not-found" | "already-used" | "exceeded-attempts" | null
  >(null)
  const [userEmail, setUserEmail] = useState<string>("")
  const [isResending, setIsResending] = useState(false)
  const [progress, setProgress] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { updateEmailVerification, user } = useAuth()

  // Simulate progress animation
  useEffect(() => {
    if (verificationStatus === "loading") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      return () => clearInterval(interval)
    }
  }, [verificationStatus])

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the token from the URL
        const token = searchParams.get("token")

        if (!token) {
          setVerificationStatus("error")
          setErrorType("invalid")
          return
        }

        // Verify the token
        const result = await verifyUserEmail(token)

        if (!result.success) {
          // Handle different error types
          setVerificationStatus("error")
          setErrorType((result.status as any) || "technical")

          if (result.email) {
            setUserEmail(result.email)
          }

          return
        }

        // Update the user's profile to mark email as verified
        if (result.userId && user) {
          await updateEmailVerification(true)
        }

        setVerificationStatus("success")
        if (result.email) {
          setUserEmail(result.email)
        }

        // Show success toast
        toast({
          title: "Email verified successfully",
          description: "Your email has been verified. You can now access all features of the platform.",
        })

        // Redirect to dashboard after a delay
        setTimeout(() => {
          router.push("/dashboard")
        }, 5000)
      } catch (error) {
        console.error("Error in email verification:", error)
        setVerificationStatus("error")
        setErrorType("technical")
      }
    }

    // Set user email if available
    if (user?.email) {
      setUserEmail(user.email)
    }

    verifyEmail()
  }, [searchParams, router, updateEmailVerification, user])

  const handleResendVerification = async () => {
    if (!userEmail && !user?.email) {
      toast({
        title: "Error",
        description: "Email address not found. Please try logging in again.",
        variant: "destructive",
      })
      return
    }

    const email = userEmail || user?.email || ""
    setIsResending(true)

    try {
      const result = await resendVerificationEmail(email)

      if (result.success) {
        toast({
          title: "Verification email sent",
          description: "Please check your inbox for the verification link.",
        })
      } else {
        // Handle specific error types
        if (result.status === "already-verified") {
          setErrorType("already-verified")
        } else if (result.status === "not-found") {
          setErrorType("not-found")
        } else if (result.status === "exceeded-attempts") {
          setErrorType("exceeded-attempts")
        } else if (result.retryAfter) {
          toast({
            title: "Too many requests",
            description: `Please wait ${result.retryAfter} minute(s) before requesting another email.`,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to send verification email. Please try again.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error resending verification:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="mx-auto w-full max-w-md overflow-hidden">
        {verificationStatus === "loading" && (
          <>
            <CardHeader className="space-y-1 text-center">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center mb-2"
              >
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary opacity-50" />
                  </div>
                </div>
              </motion.div>
              <CardTitle className="text-2xl font-bold">Verifying your email</CardTitle>
              <CardDescription>Please wait while we verify your email address...</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex justify-center items-center py-6">
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                </div>
              </div>
            </CardContent>
          </>
        )}

        {verificationStatus === "success" && <VerificationSuccessAnimation />}

        {verificationStatus === "error" && errorType && (
          <VerificationErrorGuidance
            errorType={errorType}
            email={userEmail}
            onResendClick={handleResendVerification}
            isResending={isResending}
          />
        )}

        {verificationStatus === "success" && (
          <CardFooter className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/profile">Complete Your Profile</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
