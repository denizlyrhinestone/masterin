"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle, Loader2 } from "lucide-react"

type EmailVerificationReminderProps = {
  userEmail: string
}

export function EmailVerificationReminder({ userEmail }: EmailVerificationReminderProps) {
  const [isResending, setIsResending] = useState(false)
  const supabase = createClientComponentClient()

  const handleResendVerification = async () => {
    setIsResending(true)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to resend verification email")
      }

      toast({
        title: "Verification Email Sent",
        description: "A new verification link has been sent to your email address.",
      })
    } catch (error) {
      console.error("Error resending verification email:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend verification email",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <Alert variant="warning" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Email Not Verified</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
        <span>Please verify your email address to access all features.</span>
        <Button variant="outline" size="sm" onClick={handleResendVerification} disabled={isResending}>
          {isResending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
          Resend Verification Email
        </Button>
      </AlertDescription>
    </Alert>
  )
}
