"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { EnvelopeIcon, PaperAirplaneIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const ForgotPasswordPage = () => {
  const { requestPasswordReset, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null); // For success message

  // Clear errors when component mounts or unmounts
  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    setMessage(null);
    if (!email) {
      setError("Email address cannot be empty."); // Use local error state for form validation
      return;
    }
    try {
      // requestPasswordReset from AuthContext now handles the API call.
      // The backend will always return a success-like response to prevent email enumeration.
      await requestPasswordReset(email);
      // Regardless of whether the email exists on the backend, show a generic success message.
      setSuccessMessage("If an account with that email exists, a password reset link has been sent. Please check your inbox (and spam folder). This link will expire in 1 hour.");
      setEmail(''); // Clear the email field
      clearError(); // Clear any global error from AuthContext
    } catch (err: any) {
      // This catch block will primarily handle network errors or unexpected client-side issues,
      // as AuthContext's requestPasswordReset is designed to re-throw errors for the page to handle.
      // The AuthContext might also set its own global 'error' state.
      // For this page, we can use a local error state or rely on the global one.
      // If relying on global `error` from `useAuth()`:
      // No specific action here if AuthContext.error is already displayed.
      // If we want a local error display too or instead:
      // setError(err.message || "An unexpected error occurred during the request.");
      console.error("Forgot password page caught error:", err);
      // The global error from AuthContext will be displayed by the {error && ...} block below.
      // Ensure local success message is cleared if global error is shown.
      setSuccessMessage(null);
    }
  };

  // Rename 'message' state to 'successMessage' for clarity
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  return (
    <>
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center text-gray-900 dark:text-white">
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Enter your email address below and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email address
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email} // Bind state
              onChange={(e) => setEmail(e.target.value)} // Update state
              className="appearance-none block w-full px-3 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="you@example.com"
            />
          </div>
        </div>

        {/* Display global error messages from AuthContext OR local error for form validation */}
        {error && ( // This 'error' is from useAuth()
          <Alert variant="destructive" className="my-2">
            <ExclamationTriangleIcon className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {/* Display local success message */}
        {successMessage && !error && ( // Only show success if no global error
           <Alert variant="default" className="my-2 bg-green-50 border-green-200 dark:bg-green-800 dark:border-green-700">
            <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-300" />
            <AlertTitle className="text-green-700 dark:text-green-200">Request Sent</AlertTitle>
            <AlertDescription className="text-green-600 dark:text-green-300">{successMessage}</AlertDescription>
          </Alert>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : <><PaperAirplaneIcon className="h-5 w-5 mr-2 -rotate-45" /> Send Reset Link</>}
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

export default ForgotPasswordPage;
