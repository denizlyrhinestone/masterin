"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowRight, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { resendVerification, user } = useAuth()

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const success = await resendVerification(email)

      if (success) {
        setIsSuccess(true)
        toast({
          title: "Success",
          description: "Verification email has been sent. Please check your inbox.",
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
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-2"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <Mail className="h-6 w-6 text-white" />
            </div>
          </motion.div>
          <CardTitle className="text-2xl font-bold">Resend Verification Email</CardTitle>
          <CardDescription>Enter your email address and we'll send you another verification link.</CardDescription>
        </CardHeader>

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CardContent className="space-y-4 text-center">
              <div className="flex justify-center mb-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                >
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </motion.div>
              </div>
              <p className="text-lg font-medium">Verification email sent!</p>
              <p className="text-sm text-muted-foreground">
                We've sent a verification link to <strong>{email}</strong>. Please check your inbox and follow the
                instructions to verify your email address.
              </p>
              <div className="bg-muted p-4 rounded-md mt-4">
                <p className="text-sm font-medium">Didn't receive the email?</p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                  <li>Check your spam or junk folder</li>
                  <li>Verify that you entered the correct email address</li>
                  <li>Wait a few minutes as email delivery can sometimes be delayed</li>
                  <li>If you still don't receive it, you can try again in 15 minutes</li>
                </ul>
              </div>
            </CardContent>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Verification Email"}
              </Button>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Back to login
                </Link>
              </p>
            </CardFooter>
          </form>
        )}

        {isSuccess && (
          <CardFooter className="flex flex-col">
            <Button asChild className="w-full">
              <Link href="/login">
                Back to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
