"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, AlertCircle, ArrowLeft } from "lucide-react"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const [errorTitle, setErrorTitle] = useState("Authentication Error")
  const [errorDescription, setErrorDescription] = useState("An error occurred during authentication.")

  useEffect(() => {
    const error = searchParams.get("error")
    const description = searchParams.get("description")

    if (error) {
      // Map error codes to user-friendly messages
      switch (error) {
        case "provider_not_enabled":
          setErrorTitle("Authentication Provider Not Enabled")
          setErrorDescription("The selected authentication provider is not enabled. Please contact the administrator.")
          break
        case "session_exchange_failed":
          setErrorTitle("Session Creation Failed")
          setErrorDescription("There was a problem creating your session. Please try signing in again.")
          break
        case "invalid_request":
          setErrorTitle("Invalid Authentication Request")
          setErrorDescription("The authentication request was invalid. Please try again.")
          break
        default:
          setErrorTitle("Authentication Error")
          setErrorDescription(description || "An error occurred during authentication.")
      }
    }
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold">LearnWise</span>
          </Link>
          <h1 className="text-2xl font-bold">Authentication Error</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{errorTitle}</CardTitle>
            <CardDescription>We encountered a problem during the authentication process</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorDescription}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/auth">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
            <Button asChild>
              <Link href="/">Go to Homepage</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
