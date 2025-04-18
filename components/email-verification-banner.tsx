"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Mail, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"

export function EmailVerificationBanner() {
  const [dismissed, setDismissed] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const { user, isEmailVerified, resendVerification } = useAuth()

  // Don't show if email is verified or banner was dismissed
  if (isEmailVerified || dismissed || !user) {
    return null
  }

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
    <Alert className="mb-4 bg-amber-50 border-amber-200">
      <Mail className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Verify your email address</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span className="text-amber-700">
          Please verify your email address to access all features. Check your inbox for a verification link.
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
            onClick={handleResendVerification}
            disabled={isResending}
          >
            {isResending ? "Sending..." : "Resend email"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-amber-600 hover:bg-amber-100 hover:text-amber-800"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
