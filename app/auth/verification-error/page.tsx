"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function VerificationErrorPage() {
  const searchParams = useSearchParams()
  const errorType = searchParams.get("error") || "unknown"

  const errorMessages = {
    "missing-token": "Verification link is invalid. No token was provided.",
    "invalid-token": "Verification link is invalid or has been tampered with.",
    "expired-token": "Verification link has expired. Please request a new verification email.",
    "used-token": "This verification link has already been used.",
    "update-failed": "Failed to verify your email. Please try again later.",
    "server-error": "An unexpected error occurred. Please try again later.",
    unknown: "An unknown error occurred during verification.",
  }

  const errorMessage = errorMessages[errorType as keyof typeof errorMessages] || errorMessages.unknown
  const isExpired = errorType === "expired-token"

  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-center">Verification Failed</CardTitle>
          <CardDescription className="text-center">We couldn't verify your email address.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-4">{errorMessage}</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {isExpired ? (
            <Button asChild className="w-full">
              <Link href="/auth/resend-verification">
                <RefreshCw className="mr-2 h-4 w-4" />
                Request New Verification Email
              </Link>
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link href="/auth/login">Return to Login</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
