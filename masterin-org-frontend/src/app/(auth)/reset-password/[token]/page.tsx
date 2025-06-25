"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LockClosedIcon, ArrowPathIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const ResetPasswordPage = () => {
  const { resetPassword, isLoading, error, clearError } = useAuth();
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null); // For local errors like password mismatch
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Clear errors when component mounts or unmounts
  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    setFormError(null);
    setSuccessMessage(null);

    if (!token) {
      setFormError("Password reset token is missing from the URL.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setFormError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) { // Basic validation, should match backend
        setFormError("Password must be at least 6 characters long.");
        return;
    }

    try {
      const response = await resetPassword(token, newPassword);
      if (response.success) {
        setSuccessMessage(response.message + " You can now log in.");
        // Optionally redirect to login after a delay
        setTimeout(() => router.push('/login'), 3000);
      }
      // Error is handled by AuthContext and displayed via 'error' state
    } catch (err) {
      // Error is set in AuthContext, will be displayed.
      console.error("Reset password page caught error:", err);
    }
  };

  return (
    <>
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center text-gray-900 dark:text-white">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Enter your new password below.
        </p>
        {/* For debugging, can show token: <p className="text-xs text-center text-gray-500 mt-1">Token: {token}</p> */}
      </div>

      {!token && (
        <div className="p-4 my-4 text-sm text-red-700 bg-red-100 rounded-md text-center">
            Password reset token not found in URL. Please use the link from your email.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
          <div className="mt-1 relative rounded-md shadow-sm">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input id="newPassword" name="newPassword" type="password" required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="••••••••" />
          </div>
        </div>

        <div>
          <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
           <div className="mt-1 relative rounded-md shadow-sm">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input id="confirmNewPassword" name="confirmNewPassword" type="password" required
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="••••••••" />
          </div>
        </div>

        {/* Display error messages from AuthContext or local form errors */}
        {(error || formError) && !successMessage && (
          <div className="p-3 my-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error || formError}</span>
          </div>
        )}
        {/* Display success message */}
        {successMessage && (
          <div className="p-3 my-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div>
          <button type="submit" disabled={isLoading || !token || !!successMessage}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-60 disabled:cursor-not-allowed">
            {isLoading ? 'Resetting...' : <><ArrowPathIcon className="h-5 w-5 mr-2" /> Reset Password</>}
          </button>
        </div>
      </form>
       <p className="mt-6 text-center text-sm">
        <Link href="/login" legacyBehavior>
            <a className="font-medium text-sky-600 hover:text-sky-500 hover:underline">
            Back to Login
            </a>
        </Link>
      </p>
    </>
  );
};

export default ResetPasswordPage;
