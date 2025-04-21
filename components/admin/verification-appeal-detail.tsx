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
import { sendVerificationStatusEmail } from "@/lib/email-utils"

type VerificationAppealDetailProps = {
  appealId: string
}

export function VerificationAppealDetail({ appealId }: VerificationAppealDetailProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [appeal, setAppeal] = useState<any>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const supabase = createClientComponentClient()

  // Fetch appeal details
  useState(() => {
    async function fetchAppealDetails() {
      try {
        setIsLoading(true)

        const { data, error } = await supabase
          .from("educator_verification_appeals")
          .select(`
            id,
            request_id,
            user_id,
            appeal_reason,
            additional_document_url,
            status,
            created_at,
            profiles:user_id (
              id,
              full_name,
              email
            ),
            educator_verification_requests:request_id (
              id,
              institution,
              credentials,
              document_url,
              admin_notes
            )
          `)
          .eq("id", appealId)
          .single()

        if (error) throw error

        setAppeal(data)
        setAdminNotes(data.educator_verification_requests?.admin_notes || "")
      } catch (error) {
        console.error("Error fetching appeal:", error)
        toast({
          title: "Error",
          description: "Failed to load appeal details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppealDetails()
  }, [appealId, supabase])

  const handleUpdateStatus = async (status: "approved" | "rejected") => {
    try {
      setIsSubmitting(true)

      // Update appeal status
      const { error: appealError } = await supabase
        .from("educator_verification_appeals")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", appealId)

      if (appealError) throw appealError

      // Update verification request
      const { error: requestError } = await supabase
        .from("educator_verification_requests")
        .update({
          status,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", appeal.request_id)

      if (requestError) throw requestError

      // If approved, update user profile
      if (status === "approved") {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            educator_verified: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", appeal.user_id)

        if (profileError) throw profileError
      }

      // Send email notification
      if (appeal.profiles?.email) {
        await sendVerificationStatusEmail(appeal.profiles.email, status, status === "rejected" ? adminNotes : undefined)
      }

      // Create notification
      await supabase.from("notifications").insert({
        user_id: appeal.user_id,
        type: `verification_appeal_${status}`,
        title: status === "approved" ? "Appeal Approved" : "Appeal Rejected",
        message:
          status === "approved"
            ? "Your educator verification appeal has been approved."
            : "Your educator verification appeal has been rejected.",
        read: false,
      })

      toast({
        title: status === "approved" ? "Appeal Approved" : "Appeal Rejected",
        description: `The verification appeal has been ${status}.`,
      })

      router.refresh()
      router.push("/admin/verification-appeals")
    } catch (error) {
      console.error("Error updating appeal:", error)
      toast({
        title: "Error",
        description: "Failed to update appeal",
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

  if (!appeal) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Appeal Not Found</h2>
        <p className="text-muted-foreground mt-2">The requested appeal could not be found.</p>
        <Button className="mt-4" onClick={() => router.push("/admin/verification-appeals")}>
          Back to Appeals
        </Button>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Verification Appeal</CardTitle>
        <CardDescription>
          Submitted {formatDistanceToNow(new Date(appeal.created_at), { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Educator Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p>{appeal.profiles?.full_name || "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{appeal.profiles?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Institution</p>
              <p>{appeal.educator_verification_requests?.institution || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Credentials</p>
              <p>{appeal.educator_verification_requests?.credentials || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Previous Rejection Reason</h3>
          <p className="p-3 rounded-md bg-muted">
            {appeal.educator_verification_requests?.admin_notes || "No reason provided"}
          </p>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Appeal Reason</h3>
          <p className="p-3 rounded-md bg-muted whitespace-pre-wrap">{appeal.appeal_reason}</p>
        </div>

        {appeal.educator_verification_requests?.document_url && (
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Original Document</h3>
            <div className="flex items-center gap-2 p-3 rounded-md border">
              <FileText className="h-5 w-5 text-blue-500" />
              <span className="flex-1 truncate">
                {getFileNameFromUrl(appeal.educator_verification_requests.document_url)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(appeal.educator_verification_requests.document_url, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Document
              </Button>
            </div>
          </div>
        )}

        {appeal.additional_document_url && (
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Additional Document</h3>
            <div className="flex items-center gap-2 p-3 rounded-md border">
              <FileText className="h-5 w-5 text-blue-500" />
              <span className="flex-1 truncate">{getFileNameFromUrl(appeal.additional_document_url)}</span>
              <Button variant="outline" size="sm" onClick={() => window.open(appeal.additional_document_url, "_blank")}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Document
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Admin Notes</h3>
          <Textarea
            placeholder="Add notes about this appeal (only visible to admins)"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={4}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
        <Button variant="outline" onClick={() => router.push("/admin/verification-appeals")}>
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
            Reject Appeal
          </Button>
          <Button
            variant="default"
            className="flex-1 sm:flex-initial"
            onClick={() => handleUpdateStatus("approved")}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Approve Appeal
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
