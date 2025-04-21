"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { uploadDocumentToBlob } from "@/lib/blob-utils"
import { Loader2, Upload, X } from "lucide-react"

export function EducatorVerificationForm() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [institution, setInstitution] = useState("")
  const [credentials, setCredentials] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file type and size
      const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
      const maxSize = 5 * 1024 * 1024 // 5MB

      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or image file (JPEG, PNG).",
          variant: "destructive",
        })
        return
      }

      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        })
        return
      }

      setDocumentFile(file)
    }
  }

  const removeFile = () => {
    setDocumentFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("You must be logged in to submit a verification request")
      }

      // Check if user already has a pending request
      const { data: existingRequests, error: checkError } = await supabase
        .from("educator_verification_requests")
        .select("id, status")
        .eq("user_id", user.id)
        .not("status", "eq", "rejected")
        .maybeSingle()

      if (checkError) {
        throw new Error("Failed to check existing requests")
      }

      if (existingRequests) {
        if (existingRequests.status === "pending") {
          throw new Error("You already have a pending verification request")
        } else if (existingRequests.status === "approved") {
          throw new Error("You are already verified as an educator")
        }
      }

      // Upload document if provided
      let documentUrl = null
      if (documentFile) {
        documentUrl = await uploadDocumentToBlob(documentFile, user.id)
      }

      // Submit verification request
      const { error: insertError } = await supabase.from("educator_verification_requests").insert({
        user_id: user.id,
        institution,
        credentials,
        additional_info: additionalInfo,
        document_url: documentUrl,
        status: "pending",
      })

      if (insertError) {
        throw new Error("Failed to submit verification request")
      }

      toast({
        title: "Verification Request Submitted",
        description: "Your educator verification request has been submitted for review.",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error submitting verification request:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit verification request",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Educator Verification</CardTitle>
        <CardDescription>
          Submit your credentials to get verified as an educator on our platform. This will give you access to create
          courses and other educator-specific features.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="institution">Institution</Label>
            <Input
              id="institution"
              placeholder="University, School, or Organization"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="credentials">Credentials</Label>
            <Input
              id="credentials"
              placeholder="Your position, title, or role"
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document">Supporting Document (Optional)</Label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Input
                  id="document"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </div>
              {documentFile && (
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2 truncate">
                    <div className="truncate">{documentFile.name}</div>
                    <div className="text-xs text-muted-foreground">({Math.round(documentFile.size / 1024)} KB)</div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={removeFile} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Upload a document that proves your educator status (ID card, employment letter, etc.). Accepted formats:
                PDF, JPEG, PNG. Max size: 5MB.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional-info">Additional Information (Optional)</Label>
            <Textarea
              id="additional-info"
              placeholder="Any additional information that might help with verification"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit for Verification
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
