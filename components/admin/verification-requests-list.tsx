"use client"

import { useState, useEffect, useCallback } from "react"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { MoreHorizontal, Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { supabase } from "@/lib/auth"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"

type UserType = {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  role: string
  created_at: string
}

export function VerificationRequestsList({ status = "pending" }) {
  const [requests, setRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])
  const [roleFilter, setRoleFilter] = useState("all") // Initialize roleFilter
  const router = useRouter() // Initialize router
  const [users, setUsers] = useState<any[]>([]) // Initialize users

  // Fetch verification requests
  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true)

      try {
        let query = supabase
          .from("educator_verification_requests")
          .select(
            `
              id, 
              user_id, 
              institution, 
              credentials, 
              status, 
              created_at,
              profiles:user_id (
                id,
                full_name,
                email,
                educator_title,
                educator_bio,
                email_verified
              )
            `,
          )
          .eq("status", status)
          .order("created_at", { ascending: false })
          .range((page - 1) * pageSize, page * pageSize - 1)

        // Apply role filter if not "all"
        if (roleFilter !== "all") {
          query = query.eq("role", roleFilter)
        }

        // Apply search filter if present
        if (searchQuery) {
          query = query.or(`email.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
        }

        const { data, error, count } = await query

        if (error) throw error

        setRequests(data || [])
        setTotalCount(count || 0)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [status, searchQuery, page, roleFilter])

  // View request details
  const handleViewUser = (request: any) => {
    setSelectedUser(request)
    setIsDialogOpen(true)
  }

  // Function to toggle selection of a request
  const toggleSelectedRequest = (requestId: string) => {
    setSelectedRequests((prevSelected) =>
      prevSelected.includes(requestId) ? prevSelected.filter((id) => id !== requestId) : [...prevSelected, requestId],
    )
  }

  // Function to check if a request is selected
  const isRequestSelected = (requestId: string) => selectedRequests.includes(requestId)

  // Function to handle individual request processing
  const handleProcessRequest = useCallback(
    async (action: "approved" | "rejected", requestId: string) => {
      setIsProcessing(true)

      try {
        // Update request status
        const { error: requestError } = await supabase
          .from("educator_verification_requests")
          .update({
            status: action,
            updated_at: new Date().toISOString(),
          })
          .eq("id", requestId)

        if (requestError) throw requestError

        // If approved, update user profile
        if (action === "approved") {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              educator_verified: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", selectedUser.user_id)

          if (profileError) throw profileError
        }

        // Update local state (requests)
        setRequests((prevRequests) => prevRequests.filter((req) => req.id !== requestId))

        toast({
          title: `Request ${action === "approved" ? "Approved" : "Rejected"}`,
          description: `The verification request has been ${action === "approved" ? "approved" : "rejected"} successfully.`,
        })
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
    },
    [selectedUser],
  )

  // Function to handle batch request processing
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

        if (!request) {
          console.warn(`Request with ID ${requestId} not found. Skipping.`)
          continue // Skip to next iteration if request not found
        }

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
        if (action === "approve" && request) {
          await supabase
            .from("profiles")
            .update({
              educator_verified: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", request.user_id)
        }

        // Send email notification
        // if (action === "approve" && request.profiles?.email) {
        //   await sendVerificationStatusEmail(request.profiles.email, action === "approve" ? "approved" : "rejected");
        // }
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

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault()
    // Reset to first page when searching
    setPage(1)
  }

  if (isLoading && users.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBatchAction("approve")}
          disabled={selectedRequests.length === 0 || isProcessing}
        >
          Approve Selected
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleBatchAction("reject")}
          disabled={selectedRequests.length === 0 || isProcessing}
        >
          Reject Selected
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedRequests.length === requests.length}
                onChange={(e) => setSelectedRequests(e.target.checked ? requests.map((req) => req.id) : [])}
                aria-label="Select all"
              />
            </TableHead>
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
              <TableCell>
                <Checkbox
                  checked={isRequestSelected(request.id)}
                  onChange={() => toggleSelectedRequest(request.id)}
                  aria-label={`Select request from ${request.profiles?.full_name || "Unknown"}`}
                />
              </TableCell>
              <TableCell className="font-medium">{request.profiles?.full_name || "N/A"}</TableCell>
              <TableCell>{request.profiles?.email}</TableCell>
              <TableCell>{request.institution}</TableCell>
              <TableCell>{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewUser(request)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* User Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>Verification Request Details</DialogTitle>
                <DialogDescription>
                  Review the educator verification request from{" "}
                  {selectedUser.profiles?.full_name || selectedUser.profiles?.email}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Applicant Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p>{selectedUser.profiles?.full_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p>{selectedUser.profiles?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Professional Title</p>
                      <p>{selectedUser.profiles?.educator_title || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bio</p>
                      <p className="text-sm whitespace-pre-wrap">{selectedUser.profiles?.educator_bio || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Verification Information</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Institution</p>
                      <p>{selectedUser.institution}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Credentials</p>
                      <p className="text-sm whitespace-pre-wrap">{selectedUser.credentials}</p>
                    </div>
                    {selectedUser.additional_info && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Additional Information</p>
                        <p className="text-sm whitespace-pre-wrap">{selectedUser.additional_info}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                      <p>{new Date(selectedUser.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge
                        variant={
                          selectedUser.status === "approved"
                            ? "default"
                            : selectedUser.status === "rejected"
                              ? "destructive"
                              : "outline"
                        }
                        className="capitalize"
                      >
                        {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex justify-between sm:justify-between">
                <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
