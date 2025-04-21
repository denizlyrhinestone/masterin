"use client"

import { useState, useEffect, useRef } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X, Clock, AlertTriangle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { resendVerificationEmail } from "@/app/actions/verification-actions"

export function EmailVerificationBanner() {
  const [dismissed, setDismissed] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [lastSent, setLastSent] = useState<Date | null>(null)
  const { user, profile } = useAuth()
  const interval = useRef<NodeJS.Timeout | null>(null)
  const [isBannerVisible, setIsBannerVisible] = useState(false)

  useEffect(() => {
    setIsBannerVisible(!profile?.email_verified && !dismissed && !!user)
  }, [profile?.email_verified, dismissed, user?.email])

  // Check for cooldown from localStorage
  useEffect(() => {
    let storedTime: string | null = null
    if (user && typeof window !== "undefined") {
      storedTime = localStorage.getItem(`lastEmailSent_${user?.email}`)
    }
    if (storedTime) {
      const lastSentTime = new Date(storedTime)
      setLastSent(lastSentTime)

      // Calculate remaining cooldown in seconds
      const now = new Date()
      const diffSeconds = Math.max(0, Math.floor((lastSentTime.getTime() + 5 * 60 * 1000 - now.getTime()) / 1000))
      setCooldown(diffSeconds)
    } else {
      setLastSent(null)
      setCooldown(0)
    }

    return () => {
      if (interval.current) clearInterval(interval.current)
    }
  }, [user?.email])

  // Countdown timer for cooldown
  useEffect(() => {
    if (cooldown <= 0) {
      if (interval.current) clearInterval(interval.current)
      return
    }

    interval.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (interval.current) clearInterval(interval.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (interval.current) clearInterval(interval.current)
    }
  }, [cooldown])

  const handleResendVerification = async () => {
    if (!user?.email || cooldown > 0) return

    setIsResending(true)

    try {
      const result = await resendVerificationEmail(user.email)

      if (result.success) {
        // Set cooldown
        const now = new Date()
        localStorage.setItem(`lastEmailSent_${user.email}`, now.toISOString())
        setLastSent(now)
        setCooldown(5 * 60) // 5 minutes cooldown

        toast({
          title: "Verification email sent",
          description: "Please check your inbox for the verification link.",
        })
      } else {
        if (result.status === "already-verified") {
          toast({
            title: "Already verified",
            description: "Your email has already been verified. Refresh the page to update your status.",
          })
        } else if (result.status === "not-found") {
          toast({
            title: "Account not found",
            description: "No account found with this email address. Please check the email or create a new account.",
            variant: "destructive",
          })
        } else if (result.status === "exceeded-attempts") {
          toast({
            title: "Verification limit reached",
            description: "You've exceeded the maximum number of verification attempts. Please contact support.",
            variant: "destructive",
          })
        } else if (result.retryAfter) {
          setCooldown(result.retryAfter * 60) // Convert minutes to seconds
          toast({
            title: "Rate limited",
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
    <AnimatePresence>
      {isBannerVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="flex items-center gap-2 text-amber-800">
              Please verify your email address
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-amber-500"></span>
            </AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-amber-700">
                Check your inbox for a verification link. You'll need to verify your email to access all platform
                features.
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                  onClick={handleResendVerification}
                  disabled={isResending || cooldown > 0}
                >
                  {cooldown > 0 ? (
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>
                        {Math.floor(cooldown / 60)}:{(cooldown % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                  ) : isResending ? (
                    "Sending..."
                  ) : (
                    "Resend email"
                  )}
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
        </motion.div>
      )}
    </AnimatePresence>
  )
}
