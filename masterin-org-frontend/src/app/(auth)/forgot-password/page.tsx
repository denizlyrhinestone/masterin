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
      // Basic client-side validation
      return;
    }
    try {
      const response = await requestPasswordReset(email);
      if (response.success) {
        setMessage(response.message);
        if (response._dev_token) { // For development/testing display
            console.log("DEV ONLY: Password Reset Token:", response._dev_token);
            setMessage(prev => prev + ` (DEV: Token ${response._dev_token})`);
        }
      }
      // Error is handled by AuthContext and displayed via 'error' state
    } catch (err) {
      // Error is set in AuthContext, will be displayed by the error div below
      console.error("Forgot password page caught error:", err);
    }
  };

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
              className="appearance-none block w-full px-3 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="you@example.com"
            />
          </div>
        </div>

        {/* Display error messages from AuthContext */}
        {error && (
          <div className="p-3 my-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {/* Display success message from local state */}
        {message && !error &&(
          <div className="p-3 my-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{message}</span>
          </div>
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
