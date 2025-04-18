"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { GraduationCap, Mail, CheckCircle } from "lucide-react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [gradeLevel, setGradeLevel] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password || !confirmPassword || !fullName || !gradeLevel) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { success, error } = await signUp(email, password, {
        full_name: fullName,
        grade_level: gradeLevel,
      })

      if (success) {
        setIsSuccess(true)
        toast({
          title: "Account created",
          description: "Please check your email to verify your account.",
        })
      } else {
        toast({
          title: "Error",
          description: error?.message || "Failed to create account. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Registration error:", error)
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
        {isSuccess ? (
          <>
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-2">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold">Registration Successful!</CardTitle>
              <CardDescription>
                We've sent a verification link to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="flex justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Please check your email inbox and click the verification link to activate your account.
              </p>
              <p className="text-sm text-muted-foreground">
                If you don't see the email, please check your spam folder.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button asChild className="w-full">
                <Link href="/login">Go to Login</Link>
              </Button>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Didn't receive the email?{" "}
                <Link href="/resend-verification" className="text-primary hover:underline">
                  Resend verification email
                </Link>
              </p>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
              <CardDescription>Enter your information to get started</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
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
                  <Label htmlFor="gradeLevel">Grade Level</Label>
                  <Select value={gradeLevel} onValueChange={setGradeLevel} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6th Grade</SelectItem>
                      <SelectItem value="7">7th Grade</SelectItem>
                      <SelectItem value="8">8th Grade</SelectItem>
                      <SelectItem value="9">9th Grade</SelectItem>
                      <SelectItem value="10">10th Grade</SelectItem>
                      <SelectItem value="11">11th Grade</SelectItem>
                      <SelectItem value="12">12th Grade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Are you an educator?{" "}
                  <Link href="/educator/register" className="text-primary hover:underline">
                    Register as educator
                  </Link>
                </p>
              </CardFooter>
            </form>
          </>
        )}
      </Card>
    </div>
  )
}
