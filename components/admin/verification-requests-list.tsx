"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Eye, CheckCircle, XCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { supabase } from "@/lib/auth"

export function VerificationRequestsList({ status = "pending" }) {
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch verification requests
  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true)

      try {
        const { data, error } = await supabase
          .from("educator_verification_requests")
          .select(`
            id, 
            institution, 
            credentials, 
            additional_info, 
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
          .eq("status", status)
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
  }, [status])

  // View request details
  const handleViewRequest = (request) => {
    setSelectedRequest(request)
    setAdminNotes(request.admin_notes || "")
    setIsDialogOpen(true)
  }

  // Process request (approve or reject)
  const handleProcessRequest = async (action) => {
    if (!selectedRequest) return

    setIsProcessing(true)

    try {
      // Update request status
      const { error: requestError } = await supabase
        .from("educator_verification_requests")
        .update({
          status: action,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedRequest.id)

      if (requestError) throw requestError

      // If approved, update user profile
      if (action === "approved") {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            educator_verified: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedRequest.user_id)

        if (profileError) throw profileError
      }

      // Update local state
      setRequests(requests.filter((req) => req.id !== selectedRequest.id))

      toast({
        title: `Request ${action === "approved" ? "Approved" : "Rejected"}`,
        description: `The verification request has been ${action === "approved" ? "approved" : "rejected"} successfully.`,
      })

      setIsDialogOpen(false)
    } catch (error) {
      console.error(`Error ${action === "approved" ? "approving" : "rejecting"} request:`, error)
      toast({
        title: "Error",
        description: `Failed to ${action === "approved" ? "approve" : "reject"} the verification request`,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md">
        <h3 className="text-lg font-medium mb-2">No {status} requests</h3>
        <p className="text-muted-foreground">
          {status === "pending"
            ? "There are no pending verification requests to review."
            : `There are no ${status} verification requests.`}
        </p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Institution</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.profiles?.full_name || "N/A"}</TableCell>
              <TableCell>{request.profiles?.email || "N/A"}</TableCell>
              <TableCell>{request.institution}</TableCell>
              <TableCell>{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleViewRequest(request)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Request Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle>Verification Request Details</DialogTitle>
                <DialogDescription>
                  Review the educator verification request from{" "}
                  {selectedRequest.profiles?.full_name || selectedRequest.profiles?.email}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Applicant Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p>{selectedRequest.profiles?.full_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p>{selectedRequest.profiles?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Professional Title</p>
                      <p>{selectedRequest.profiles?.educator_title || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bio</p>
                      <p className="text-sm">{selectedRequest.profiles?.educator_bio || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Verification Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Institution</p>
                      <p>{selectedRequest.institution}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Credentials</p>
                      <p className="text-sm whitespace-pre-wrap">{selectedRequest.credentials}</p>
                    </div>
                    {selectedRequest.additional_info && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Additional Information</p>
                        <p className="text-sm whitespace-pre-wrap">{selectedRequest.additional_info}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                      <p>{new Date(selectedRequest.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge
                        variant={
                          selectedRequest.status === "approved"
                            ? "default"
                            : selectedRequest.status === "rejected"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {status === "pending" && (
                <div className="space-y-2 py-2">
                  <label className="text-sm font-medium">Admin Notes</label>
                  <Textarea
                    placeholder="Add notes about this verification request..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              {status !== "pending" && selectedRequest.admin_notes && (
                <div className="space-y-2 py-2">
                  <label className="text-sm font-medium">Admin Notes</label>
                  <div className="p-3 bg-muted rounded-md whitespace-pre-wrap text-sm">
                    {selectedRequest.admin_notes}
                  </div>
                </div>
              )}

              <DialogFooter className="flex justify-between sm:justify-between">
                {status === "pending" ? (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => handleProcessRequest("rejected")}
                      disabled={isProcessing}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button onClick={() => handleProcessRequest("approved")} disabled={isProcessing}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
