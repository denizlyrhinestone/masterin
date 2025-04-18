"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"

export default function VerifyEmailRequiredPage() {
  const [isResending, setIsResending] = useState(false)
  const { user, resendVerification } = useAuth()

  const handleResendVerification = async () => {
    if (!user?.email) return

    setIsResending(true)

    try {
      const success = await resendVerification(user.email)

      if (success) {
        toast({
          title: "Verification email sent",
          description: "Please check your inbox for the verification link.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to send verification email. Please try again.",
          variant: "destructive",
        })
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
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <Mail className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Email Verification Required</CardTitle>
          <CardDescription>You need to verify your email address before accessing this page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            We've sent a verification link to <strong>{user?.email}</strong>. Please check your inbox and follow the
            instructions to verify your email address.
          </p>
          <p className="text-sm text-muted-foreground">
            If you don't see the email, please check your spam folder or click the button below to resend the
            verification email.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button className="w-full" onClick={handleResendVerification} disabled={isResending}>
            {isResending ? "Sending..." : "Resend Verification Email"}
          </Button>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already verified?{" "}
            <Link href="/dashboard" className="text-primary hover:underline">
              Go to Dashboard
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
