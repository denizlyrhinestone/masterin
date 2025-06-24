"use client";

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import { AdminUser, AdminUsersApiResponse } from '@/types/adminTypes';
import PaginationControls from '@/components/common/PaginationControls';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast"; // Assuming shadcn/ui toast
import { Input } from '@/components/ui/input'; // For potential search/filter later
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const UsersPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10); // Or whatever default you prefer
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<AdminUser['role'] | ''>('');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { toast } = useToast();

  const fetchUsers = useCallback(async (page: number, currentLimit: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<AdminUsersApiResponse>(`/admin/users?page=${page}&limit=${currentLimit}`);
      setUsers(response.data.users);
      setTotalUsers(response.data.totalUsers);
      setCurrentPage(response.data.page);
      setLimit(response.data.limit);
      setTotalPages(response.data.totalPages);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Failed to fetch users.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(currentPage, limit);
  }, [fetchUsers, currentPage, limit]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const openEditRoleModal = (user: AdminUser) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setIsModalOpen(true);
  };

  const handleRoleUpdate = async () => {
    if (!editingUser || !selectedRole || selectedRole === editingUser.role) {
      setIsModalOpen(false);
      return;
    }
    setIsUpdatingRole(true);
    try {
      await apiClient.put(`/admin/users/${editingUser.id}/role`, { role: selectedRole });
      toast({
        title: "Role Updated",
        description: `User ${editingUser.email}'s role has been updated to ${selectedRole}.`,
      });
      // Refetch users or update local state
      fetchUsers(currentPage, limit); // Simplest way to see changes
      // Or, more optimistically:
      // setUsers(prevUsers => prevUsers.map(u => u.id === editingUser.id ? {...u, role: selectedRole} : u));
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Error updating role:", err);
      toast({
        title: "Error Updating Role",
        description: err.response?.data?.message || "Could not update user role.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const LoadingRowSkeleton = () => (
    <TableRow>
      <TableCell><Skeleton className="h-5 w-10" /></TableCell>
      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
    </TableRow>
  );


  return (
    <div className="container mx-auto py-8 px-4 md:px-0">
      <h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-slate-100">User Management</h1>

      {error && (
         <Alert variant="destructive" className="mb-4">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden">
        <TableHeader className="sr-only"> {/* Hidden header for structure, actual headers in TableHead */}
            <TableRow>
                <TableHead>ID</TableHead><TableHead>Email</TableHead><TableHead>Full Name</TableHead>
                <TableHead>Role</TableHead><TableHead>Joined</TableHead><TableHead>Actions</TableHead>
            </TableRow>
        </TableHeader>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-700">
              <TableHead className="w-[80px]">User ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead className="w-[100px]">Role</TableHead>
              <TableHead className="w-[180px]">Joined Date</TableHead>
              <TableHead className="w-[120px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: limit }).map((_, index) => <LoadingRowSkeleton key={index} />)
            ) : users.length === 0 && !error ? (
                <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-slate-500 dark:text-slate-400">
                        No users found.
                    </TableCell>
                </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50">
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.full_name || 'N/A'}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="outline" size="sm" onClick={() => openEditRoleModal(user)}>
                      Edit Role
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!isLoading && totalPages > 0 && (
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={limit}
                totalItems={totalUsers}
            />
        )}
      </div>

      {editingUser && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit User Role</DialogTitle>
              <DialogDescription>
                Change the role for {editingUser.email}. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role-select" className="text-right">
                  Role
                </Label>
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AdminUser['role'])}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              </DialogClose>
              <Button type="submit" onClick={handleRoleUpdate} disabled={isUpdatingRole || selectedRole === editingUser.role}>
                {isUpdatingRole ? 'Saving...' : 'Save Role'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UsersPage;
