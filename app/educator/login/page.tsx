"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { GraduationCap } from "lucide-react"

export default function EducatorLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { success, error } = await signIn(email, password)

      if (success) {
        // Check if user is an educator
        const response = await fetch("/api/auth/check-educator", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()

        if (data.isEducator) {
          toast({
            title: "Success",
            description: "You have been logged in successfully",
          })

          // Redirect to educator dashboard
          router.push("/educator/dashboard")
        } else {
          // Not an educator, sign out and show error
          await fetch("/api/auth/signout", {
            method: "POST",
          })

          toast({
            title: "Error",
            description:
              "This account is not registered as an educator. Please use the student login or register as an educator.",
            variant: "destructive",
          })

          // Redirect back to educator login
          router.push("/educator/login")
        }
      } else {
        toast({
          title: "Error",
          description: error?.message || "Failed to log in. Please check your credentials.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
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
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Educator Login</CardTitle>
          <CardDescription>Sign in to your educator account</CardDescription>
        </CardHeader>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in as Educator"}
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an educator account?{" "}
              <Link href="/educator/register" className="text-primary hover:underline">
                Register as educator
              </Link>
            </p>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Are you a student?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in as student
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
