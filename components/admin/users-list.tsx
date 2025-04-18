"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Search, MoreHorizontal, UserCheck, UserX, Shield, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { supabase } from "@/lib/auth"

export function UsersList({ roleFilter = "all" }) {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)

      try {
        let query = supabase
          .from("profiles")
          .select("*", { count: "exact" })
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

        setUsers(data || [])
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

    fetchUsers()
  }, [roleFilter, searchQuery, page])

  // View user details
  const handleViewUser = (user) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  // Update user role
  const handleUpdateRole = async (userId, newRole) => {
    setIsProcessing(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          role: newRole,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) throw error

      // Update local state
      setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))

      toast({
        title: "Role Updated",
        description: `User role has been updated to ${newRole}.`,
      })

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Toggle educator verification
  const handleToggleEducatorVerification = async (userId, currentStatus) => {
    setIsProcessing(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          educator_verified: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) throw error

      // Update local state
      setUsers(users.map((user) => (user.id === userId ? { ...user, educator_verified: !currentStatus } : user)))

      toast({
        title: currentStatus ? "Verification Removed" : "Verification Approved",
        description: `Educator verification has been ${currentStatus ? "removed" : "approved"}.`,
      })

      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error toggling educator verification:", error)
      toast({
        title: "Error",
        description: "Failed to update educator verification status",
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
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No users found. Try adjusting your search or filters.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name || "N/A"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={user.role === "admin" ? "default" : user.role === "educator" ? "secondary" : "outline"}
                      className="capitalize"
                    >
                      {user.role}
                    </Badge>
                    {user.role === "educator" && (
                      <Badge variant={user.educator_verified ? "default" : "outline"} className="text-xs">
                        {user.educator_verified ? "Verified" : "Unverified"}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewUser(user)}>View Details</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.role !== "admin" && (
                        <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "admin")}>
                          <Shield className="h-4 w-4 mr-2" />
                          Make Admin
                        </DropdownMenuItem>
                      )}
                      {user.role !== "educator" && (
                        <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "educator")}>
                          <User className="h-4 w-4 mr-2" />
                          Make Educator
                        </DropdownMenuItem>
                      )}
                      {user.role !== "student" && (
                        <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "student")}>
                          <User className="h-4 w-4 mr-2" />
                          Make Student
                        </DropdownMenuItem>
                      )}
                      {user.role === "educator" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleEducatorVerification(user.id, user.educator_verified)}
                          >
                            {user.educator_verified ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Remove Verification
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Verify Educator
                              </>
                            )}
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} users
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* User Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
                <DialogDescription>View and manage user information</DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p>{selectedUser.full_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Role</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          selectedUser.role === "admin"
                            ? "default"
                            : selectedUser.role === "educator"
                              ? "secondary"
                              : "outline"
                        }
                        className="capitalize"
                      >
                        {selectedUser.role}
                      </Badge>
                      {selectedUser.role === "educator" && (
                        <Badge variant={selectedUser.educator_verified ? "default" : "outline"} className="text-xs">
                          {selectedUser.educator_verified ? "Verified" : "Unverified"}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Joined</p>
                    <p>{new Date(selectedUser.created_at).toLocaleString()}</p>
                  </div>
                  {selectedUser.role === "educator" && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Educator Details</p>
                      <div className="mt-1 space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">Title:</span> {selectedUser.educator_title || "N/A"}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Bio:</span> {selectedUser.educator_bio || "N/A"}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Verification Status:</span>{" "}
                          {selectedUser.educator_verified ? "Verified" : "Not Verified"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="flex flex-col gap-2 sm:flex-row">
                {selectedUser.role === "educator" && (
                  <Button
                    variant={selectedUser.educator_verified ? "outline" : "default"}
                    onClick={() => handleToggleEducatorVerification(selectedUser.id, selectedUser.educator_verified)}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {selectedUser.educator_verified ? (
                      <>
                        <UserX className="h-4 w-4 mr-2" />
                        Remove Verification
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Verify Educator
                      </>
                    )}
                  </Button>
                )}
                <Button onClick={() => setIsDialogOpen(false)} className="w-full">
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
