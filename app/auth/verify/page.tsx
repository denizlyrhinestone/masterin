"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabaseAuth } from "@/lib/supabase-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, AlertCircle, Loader2, CheckCircle } from "lucide-react"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token")
        const type = searchParams.get("type")

        if (!token || type !== "email_confirmation") {
          setError("Invalid verification link. Please request a new one.")
          setIsLoading(false)
          return
        }

        // Verify the token with Supabase
        const { error } = await supabaseAuth.auth.verifyOtp({
          token_hash: token,
          type: "email",
        })

        if (error) {
          setError(error.message)
        } else {
          setSuccess("Email verified successfully! You can now log in to your account.")
          setTimeout(() => {
            router.push("/auth?action=login")
          }, 3000)
        }
      } catch (err: any) {
        setError(err.message || "An error occurred during verification")
      } finally {
        setIsLoading(false)
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold">LearnWise</span>
          </Link>
          <h1 className="text-2xl font-bold">Email Verification</h1>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p>Verifying your email...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 text-center">
            <Link href="/auth" className="text-sm text-blue-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
