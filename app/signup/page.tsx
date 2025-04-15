"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/stack-auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()
  const { signIn, isLoading } = useAuth()
  const [isSigningUp, setIsSigningUp] = useState(false)

  const handleSignUp = async () => {
    setIsSigningUp(true)
    try {
      // For now, we'll use the same signIn function since we're just simulating
      signIn()
      router.push("/dashboard")
    } catch (error) {
      console.error("Error signing up:", error)
    } finally {
      setIsSigningUp(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">Sign up to start your learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={handleSignUp} className="w-full" disabled={isLoading || isSigningUp}>
              {isSigningUp ? "Creating account..." : "Sign up with Stack"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" disabled={isLoading || isSigningUp}>
                Google
              </Button>
              <Button variant="outline" disabled={isLoading || isSigningUp}>
                GitHub
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
