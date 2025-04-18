"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="space-y-1 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-2"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Mail className="h-6 w-6 text-amber-600" />
              </div>
            </motion.div>
            <CardTitle className="text-2xl font-bold">Email Verification Required</CardTitle>
            <CardDescription>You need to verify your email address before accessing this page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-amber-50 border border-amber-200 rounded-md p-4 flex gap-3"
            >
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800">
                  We've sent a verification link to <strong>{user?.email}</strong>. Please check your inbox and follow
                  the instructions to verify your email address.
                </p>
              </div>
            </motion.div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                If you don't see the email, please check your spam folder or click the button below to resend the
                verification email.
              </p>

              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium">Why is email verification important?</p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                  <li>It helps us confirm your identity</li>
                  <li>It protects your account from unauthorized access</li>
                  <li>It allows you to recover your account if you forget your password</li>
                  <li>It gives you access to all features of the platform</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full" onClick={handleResendVerification} disabled={isResending}>
              {isResending ? "Sending..." : "Resend Verification Email"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already verified?{" "}
              <Link href="/dashboard" className="text-primary hover:underline">
                Go to Dashboard
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
