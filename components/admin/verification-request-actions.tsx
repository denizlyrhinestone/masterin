"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export function VerificationRequestActions({ request }) {
  const [adminNotes, setAdminNotes] = useState(request.admin_notes || "")
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const handleProcessRequest = async (action: "approved" | "rejected") => {
    setIsProcessing(true)

    try {
      const response = await fetch(`/api/admin/verification-requests/${request.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: action,
          admin_notes: adminNotes,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to process request")
      }

      toast({
        title: `Request ${action === "approved" ? "Approved" : "Rejected"}`,
        description: `The verification request has been ${action === "approved" ? "approved" : "rejected"} successfully.`,
      })

      // Refresh the page or redirect
      router.refresh()
      router.push("/admin/verification-requests")
    } catch (error) {
      console.error(`Error ${action === "approved" ? "approving" : "rejecting"} request:`, error)
      toast({
        title: "Error",
        description:
          error.message || `Failed to ${action === "approved" ? "approve" : "reject"} the verification request`,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Admin Notes</label>
        <Textarea
          placeholder="Add notes about this verification request..."
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          rows={4}
        />
        <p className="text-xs text-muted-foreground mt-1">
          These notes will be visible to administrators and can help with decision-making.
        </p>
      </div>

      <div className="flex justify-between">
        <Button variant="destructive" onClick={() => handleProcessRequest("rejected")} disabled={isProcessing}>
          <XCircle className="h-4 w-4 mr-2" />
          Reject Request
        </Button>
        <Button onClick={() => handleProcessRequest("approved")} disabled={isProcessing}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Approve Request
        </Button>
      </div>
    </div>
  )
}
