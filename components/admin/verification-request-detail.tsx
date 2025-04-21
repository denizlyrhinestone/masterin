"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2, FileText, ExternalLink } from "lucide-react"
import { getFileNameFromUrl } from "@/lib/blob-utils"
import { formatDistanceToNow } from "date-fns"

type VerificationRequestDetailProps = {
  requestId: string
}

export function VerificationRequestDetail({ requestId }: VerificationRequestDetailProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [request, setRequest] = useState<any>(null)
  const [adminNotes, setAdminNotes] = useState("")

  // Fetch request details
  useState(() => {
    async function fetchRequestDetails() {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from("educator_verification_requests")
          .select(`
            id, 
            institution, 
            credentials, 
            additional_info, 
            document_url,
            status, 
            admin_notes, 
            created_at,
            user_id,
            profiles:user_id (
              id,
              full_name,
              email,
              educator_title,
              educator_bio
            )
          `)
          .eq("id", requestId)
          .single()

        if (error) throw error

        setRequest(data)
        setAdminNotes(data.admin_notes || "")
      } catch (error) {
        console.error("Error fetching verification request:", error)
        toast({
          title: "Error",
          description: "Failed to load verification request details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequestDetails()
  }, [requestId, supabase])

  const handleUpdateStatus = async (status: "approved" | "rejected") => {
    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/admin/verification-requests/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          admin_notes: adminNotes,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update verification request")
      }

      toast({
        title: status === "approved" ? "Request Approved" : "Request Rejected",
        description: `The verification request has been ${status}.`,
      })

      router.refresh()
      router.push("/admin/verification-requests")
    } catch (error) {
      console.error("Error updating verification request:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update verification request",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Verification Request Not Found</h2>
        <p className="text-muted-foreground mt-2">The requested verification request could not be found.</p>
        <Button className="mt-4" onClick={() => router.push("/admin/verification-requests")}>
          Back to Verification Requests
        </Button>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Verification Request Details</CardTitle>
        <CardDescription>
          Submitted {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Educator Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p>{request.profiles?.full_name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{request.profiles?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Educator Title</p>
              <p>{request.profiles?.educator_title || "Not specified"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Verification Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Institution</p>
              <p>{request.institution}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Credentials</p>
              <p>{request.credentials}</p>
            </div>
          </div>
        </div>

        {request.document_url && (
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Supporting Document</h3>
            <div className="flex items-center gap-2 p-3 rounded-md border">
              <FileText className="h-5 w-5 text-blue-500" />
              <span className="flex-1 truncate">{getFileNameFromUrl(request.document_url)}</span>
              <Button variant="outline" size="sm" onClick={() => window.open(request.document_url, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Document
              </Button>
            </div>
          </div>
        )}

        {request.additional_info && (
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            <p className="whitespace-pre-wrap">{request.additional_info}</p>
          </div>
        )}

        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Admin Notes</h3>
          <Textarea
            placeholder="Add notes about this verification request (only visible to admins)"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={4}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <Button variant="outline" onClick={() => router.push("/admin/verification-requests")}>
          Back
        </Button>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            variant="destructive"
            className="flex-1 sm:flex-initial"
            onClick={() => handleUpdateStatus("rejected")}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reject
          </Button>
          <Button
            variant="default"
            className="flex-1 sm:flex-initial"
            onClick={() => handleUpdateStatus("approved")}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Approve
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
