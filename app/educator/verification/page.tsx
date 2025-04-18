"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { UploadIcon as FileUpload, GraduationCap, Info } from "lucide-react"

export default function EducatorVerificationPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [institution, setInstitution] = useState("")
  const [credentials, setCredentials] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!institution || !credentials) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Submit verification request
      const response = await fetch("/api/educator/verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          institution,
          credentials,
          additionalInfo,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Verification Request Submitted",
          description: "Your verification request has been submitted and is pending review.",
        })

        await refreshProfile()
        router.push("/educator/dashboard")
      } else {
        throw new Error(data.error || "Failed to submit verification request")
      }
    } catch (error) {
      console.error("Verification error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check if already verified
  if (profile?.educator_verified) {
    return (
      <ProtectedRoute allowedRoles={["educator"]}>
        <div className="container mx-auto p-6">
          <Card className="mx-auto max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Verification Complete</CardTitle>
              <CardDescription>Your educator account has been verified</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4">You now have full access to all educator features.</p>
              <Button onClick={() => router.push("/educator/dashboard")}>Go to Educator Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["educator"]}>
      <div className="container mx-auto p-6">
        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle>Educator Verification</CardTitle>
            <CardDescription>Please provide information to verify your educator status</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Verification helps us ensure the quality of our educational content. Your information will be
                      reviewed by our team.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">Educational Institution</Label>
                <Input
                  id="institution"
                  placeholder="University of Example"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">The school, college, or university where you teach</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="credentials">Professional Credentials</Label>
                <Textarea
                  id="credentials"
                  placeholder="Ph.D. in Biology, 10 years teaching experience..."
                  value={credentials}
                  onChange={(e) => setCredentials(e.target.value)}
                  className="min-h-[100px]"
                  required
                />
                <p className="text-xs text-muted-foreground">Your degrees, certifications, and teaching experience</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Any additional information that may help with verification..."
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Upload Credentials (Optional)</Label>
                <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                  <div className="space-y-1 text-center">
                    <FileUpload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="flex text-sm text-muted-foreground">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80"
                      >
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-muted-foreground">PDF, DOC, or image files up to 10MB</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit for Verification"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
