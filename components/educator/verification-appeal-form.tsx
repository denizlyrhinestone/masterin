"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { uploadDocumentToBlob } from "@/lib/blob-utils"
import { Loader2, Upload, X } from "lucide-react"

type VerificationAppealFormProps = {
  requestId: string
  previousReason?: string
}

export function VerificationAppealForm({ requestId, previousReason }: VerificationAppealFormProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [appealReason, setAppealReason] = useState("")
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
        throw new Error("You must be logged in to submit an appeal")
      }

      // Upload document if provided
      let documentUrl = null
      if (documentFile) {
        documentUrl = await uploadDocumentToBlob(documentFile, user.id)
      }

      // Create appeal record
      const { error: appealError } = await supabase.from("educator_verification_appeals").insert({
        request_id: requestId,
        user_id: user.id,
        appeal_reason: appealReason,
        additional_document_url: documentUrl,
        status: "pending",
      })

      if (appealError) {
        throw new Error("Failed to submit appeal")
      }

      // Update original request status to appealed
      const { error: updateError } = await supabase
        .from("educator_verification_requests")
        .update({
          status: "appealed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)

      if (updateError) {
        throw new Error("Failed to update verification request")
      }

      toast({
        title: "Appeal Submitted",
        description: "Your appeal has been submitted for review.",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error submitting appeal:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit appeal",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Appeal Verification Decision</CardTitle>
        <CardDescription>
          Provide additional information or documentation to support your educator verification request.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {previousReason && (
            <div className="rounded-md bg-muted p-4">
              <p className="font-medium">Reason for rejection:</p>
              <p className="mt-1">{previousReason}</p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="appeal-reason" className="block text-sm font-medium">
              Appeal Reason
            </label>
            <Textarea
              id="appeal-reason"
              placeholder="Explain why you believe your verification request should be reconsidered..."
              value={appealReason}
              onChange={(e) => setAppealReason(e.target.value)}
              rows={6}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="document" className="block text-sm font-medium">
              Additional Supporting Document
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
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
                  Upload Additional Document
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
                Upload additional documentation to support your appeal. Accepted formats: PDF, JPEG, PNG. Max size: 5MB.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Appeal
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
