"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/apiClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For displaying messages
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'; // For icons in alerts

const ChangePasswordPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }
    // Basic complexity: check for a letter and a number. More can be added.
    if (!/\d/.test(newPassword) || !/[a-zA-Z]/.test(newPassword)) {
        setError("New password must contain at least one letter and one number.");
        return;
    }


    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/users/profile/change-password', {
        currentPassword,
        newPassword,
      });
      setSuccessMessage(response.data.message || "Password changed successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to change password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sky-600"></div></div>;
  }

  if (!isAuthenticated) {
     return (
      <div className="container mx-auto px-4 py-10 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You must be logged in to change your password.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard/profile">
          <Button variant="outline" className="text-sm">
            &larr; Back to Profile
          </Button>
        </Link>
      </div>
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Change Your Password</CardTitle>
          <CardDescription>Choose a strong new password to keep your account secure.</CardDescription>
        </CardHeader>
        <form onSubmit={handleChangePassword}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <ExclamationTriangleIcon className="h-5 w-5" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert variant="default" className="bg-green-50 border-green-300 text-green-700">
                 <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter your current password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter your new password"
              />
              <p className="text-xs text-slate-500">Minimum 8 characters, including a letter and a number.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                placeholder="Confirm your new password"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? 'Changing Password...' : 'Change Password'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ChangePasswordPage;
