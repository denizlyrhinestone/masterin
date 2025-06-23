"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlusIcon, EnvelopeIcon, LockClosedIcon, UserGroupIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const SignupPage = () => {
  const { signup, isLoading, error, clearError, isAuthenticated } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [formError, setFormError] = useState<string | null>(null); // For client-side validation like password mismatch

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Clear errors when component mounts or unmounts
  useEffect(() => {
    clearError(); // Clear context error
    return () => clearError();
  }, [clearError]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError(); // Clear context error
    setFormError(null); // Clear local form error

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    // Other client-side validations can be added here

    try {
      await signup(email, password, role);
      // Signup success, AuthContext might not auto-login.
      // Usually, user is redirected to login or shown a "check your email" message.
      // For this example, let's assume we want to redirect to login with a success message.
      router.push('/login?signupSuccess=true');
    } catch (err) {
      // Error is set in AuthContext, will be displayed by the error div below.
      // Or, if signup itself throws, it might be caught here if not re-thrown by context.
      // If AuthContext's signup re-throws, this catch might be redundant for context errors.
      console.error("Signup page caught error:", err);
      // setFormError((err as Error).message || "An unexpected error occurred during signup."); // Set local error if context doesn't display it
    }
  };

  return (
    <>
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Or{' '}
          <Link href="/login" legacyBehavior>
            <a className="font-medium text-sky-600 hover:text-sky-500 hover:underline">
              log in if you already have one
            </a>
          </Link>
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
            <input id="email" name="email" type="email" autoComplete="email" required
              className="appearance-none block w-full px-3 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="you@example.com" />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input id="password" name="password" type="password" autoComplete="new-password" required
              className="appearance-none block w-full px-3 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="••••••••" />
          </div>
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
          <div className="mt-1 relative rounded-md shadow-sm">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required
              className="appearance-none block w-full px-3 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="••••••••" />
          </div>
        </div>

        <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">I am a...</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserGroupIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <select id="role" name="role" required defaultValue="student"
                className="appearance-none block w-full px-3 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                </select>
            </div>
        </div>

        {/* Display error messages from AuthContext or local form errors */}
        {(error || formError) && (
          <div className="p-3 my-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error || formError}</span>
          </div>
        )}

        <div>
          <button type="submit" disabled={isLoading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-60 disabled:cursor-not-allowed">
            {isLoading ? 'Signing up...' : <><UserPlusIcon className="h-5 w-5 mr-2" /> Sign Up</>}
          </button>
        </div>
      </form>
    </>
  );
};

export default SignupPage;
