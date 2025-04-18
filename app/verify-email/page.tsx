"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"

export default function VerifyEmailPage() {
  const [verificationStatus, setVerificationStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { updateEmailVerification } = useAuth()

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the token from the URL
        const token = searchParams.get("token_hash")
        const type = searchParams.get("type")

        if (!token || type !== "email") {
          setVerificationStatus("error")
          setErrorMessage("Invalid verification link. Please request a new verification email.")
          return
        }

        // Verify the email with Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email",
        })

        if (error) {
          console.error("Error verifying email:", error)
          setVerificationStatus("error")
          setErrorMessage(error.message || "Failed to verify email. Please try again.")
          return
        }

        // Update the user's profile to mark email as verified
        await updateEmailVerification(true)

        setVerificationStatus("success")

        // Redirect to dashboard after a delay
        setTimeout(() => {
          router.push("/dashboard")
        }, 3000)
      } catch (error) {
        console.error("Error in email verification:", error)
        setVerificationStatus("error")
        setErrorMessage("An unexpected error occurred. Please try again.")
      }
    }

    verifyEmail()
  }, [searchParams, router, updateEmailVerification])

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          {verificationStatus === "loading" && (
            <>
              <div className="flex justify-center mb-2">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Verifying your email</CardTitle>
              <CardDescription>Please wait while we verify your email address...</CardDescription>
            </>
          )}

          {verificationStatus === "success" && (
            <>
              <div className="flex justify-center mb-2">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold">Email verified!</CardTitle>
              <CardDescription>Your email has been successfully verified.</CardDescription>
            </>
          )}

          {verificationStatus === "error" && (
            <>
              <div className="flex justify-center mb-2">
                <XCircle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold">Verification failed</CardTitle>
              <CardDescription>{errorMessage}</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {verificationStatus === "success" && (
            <p className="text-center text-sm text-muted-foreground">
              You will be redirected to your dashboard in a few seconds...
            </p>
          )}

          {verificationStatus === "error" && (
            <p className="text-center text-sm text-muted-foreground">
              Please try again or contact support if the problem persists.
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col">
          {verificationStatus === "success" && (
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          )}

          {verificationStatus === "error" && (
            <div className="space-y-2 w-full">
              <Button asChild className="w-full">
                <Link href="/resend-verification">Resend Verification Email</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Back to Login</Link>
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
