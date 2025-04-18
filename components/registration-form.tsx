"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { GraduationCap, Mail, CheckCircle } from "lucide-react"
import { registerUser } from "@/app/actions/user-actions"

export function RegistrationForm() {
  const [isEducator, setIsEducator] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [email, setEmail] = useState("")
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)

    try {
      const result = await registerUser(formData)

      if (result.success) {
        setIsSuccess(true)
        setEmail(formData.get("email") as string)
        toast({
          title: "Account created",
          description: "Please check your email to verify your account.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create account. Please try again.",
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
            <p className="text-sm text-muted-foreground">If you don't see the email, please check your spam folder.</p>
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
          <form action={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="name@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Account Type</Label>
                <Select
                  name="role"
                  defaultValue="student"
                  onValueChange={(value) => setIsEducator(value === "educator")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="educator">Educator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!isEducator ? (
                <div className="space-y-2">
                  <Label htmlFor="gradeLevel">Grade Level</Label>
                  <Select name="gradeLevel" defaultValue="10">
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
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="educatorTitle">Professional Title</Label>
                    <Input
                      id="educatorTitle"
                      name="educatorTitle"
                      placeholder="Professor of Biology"
                      required={isEducator}
                    />
                    <p className="text-xs text-muted-foreground">Your professional title or specialization</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="educatorBio">Professional Bio</Label>
                    <Textarea
                      id="educatorBio"
                      name="educatorBio"
                      placeholder="Share your educational background, teaching experience, and areas of expertise..."
                      className="min-h-[100px]"
                      required={isEducator}
                    />
                    <p className="text-xs text-muted-foreground">This will be displayed on your educator profile</p>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" required />
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
              {!isEducator && (
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Are you an educator?{" "}
                  <Link href="/educator/register" className="text-primary hover:underline">
                    Register as educator
                  </Link>
                </p>
              )}
            </CardFooter>
          </form>
        </>
      )}
    </Card>
  )
}
