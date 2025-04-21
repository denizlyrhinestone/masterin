"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { Loader2, ChevronDown, ExternalLink } from "lucide-react"
import { sendVerificationStatusEmail } from "@/lib/email-utils"

export function VerificationRequestsBatch() {
  const router = useRouter()
  const [requests, setRequests] = useState([])
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true)

        const { data, error } = await supabase
          .from("educator_verification_requests")
          .select(`
            id,
            user_id,
            institution,
            credentials,
            status,
            created_at,
            profiles:user_id (
              full_name,
              email
            )
          `)
          .eq("status", "pending")
          .order("created_at", { ascending: false })

        if (error) throw error

        setRequests(data || [])
      } catch (error) {
        console.error("Error fetching verification requests:", error)
        toast({
          title: "Error",
          description: "Failed to load verification requests",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [supabase])

  const handleSelectAll = () => {
    if (selectedRequests.length === requests.length) {
      setSelectedRequests([])
    } else {
      setSelectedRequests(requests.map((request) => request.id))
    }
  }

  const handleSelectRequest = (id: string) => {
    if (selectedRequests.includes(id)) {
      setSelectedRequests(selectedRequests.filter((requestId) => requestId !== id))
    } else {
      setSelectedRequests([...selectedRequests, id])
    }
  }

  const handleBatchAction = async (action: "approve" | "reject") => {
    if (selectedRequests.length === 0) {
      toast({
        title: "No Requests Selected",
        description: "Please select at least one verification request.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)

      // Process each selected request
      for (const requestId of selectedRequests) {
        const request = requests.find((r) => r.id === requestId)

        // Update request status
        const { error: updateError } = await supabase
          .from("educator_verification_requests")
          .update({
            status: action === "approve" ? "approved" : "rejected",
            updated_at: new Date().toISOString(),
          })
          .eq("id", requestId)

        if (updateError) {
          console.error(`Error updating request ${requestId}:`, updateError)
          continue
        }

        // If approved, update user profile
        if (action === "approve") {
          await supabase
            .from("profiles")
            .update({
              educator_verified: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", request.user_id)
        }

        // Send email notification
        if (request.profiles?.email) {
          await sendVerificationStatusEmail(request.profiles.email, action === "approve" ? "approved" : "rejected")
        }

        // Create notification
        await supabase.from("notifications").insert({
          user_id: request.user_id,
          type: `verification_${action === "approve" ? "approved" : "rejected"}`,
          title: action === "approve" ? "Verification Approved" : "Verification Rejected",
          message:
            action === "approve"
              ? "Your educator verification request has been approved."
              : "Your educator verification request has been rejected.",
          read: false,
        })
      }

      toast({
        title: `Batch ${action === "approve" ? "Approval" : "Rejection"} Complete`,
        description: `Successfully processed ${selectedRequests.length} verification requests.`,
      })

      // Refresh the list
      router.refresh()

      // Clear selection
      setSelectedRequests([])

      // Remove processed requests from the list
      setRequests(requests.filter((request) => !selectedRequests.includes(request.id)))
    } catch (error) {
      console.error("Error in batch processing:", error)
      toast({
        title: "Error",
        description: "Failed to process some requests. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleViewRequest = (id: string) => {
    router.push(`/admin/verification-requests/${id}`)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pending Verification Requests</CardTitle>
        {selectedRequests.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selectedRequests.length} selected</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isProcessing}>
                  {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Batch Actions
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBatchAction("approve")}>Approve Selected</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBatchAction("reject")}>Reject Selected</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No pending verification requests found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRequests.length === requests.length && requests.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Educator</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRequests.includes(request.id)}
                      onCheckedChange={() => handleSelectRequest(request.id)}
                      aria-label={`Select request from ${request.profiles?.full_name || "Unknown"}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.profiles?.full_name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">{request.profiles?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{request.institution}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{request.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleViewRequest(request.id)}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
