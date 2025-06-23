"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import { User } from '@/types/authTypes';

// Define a simple LoadingSpinner component locally or import if you have one
const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };
  return (
    <div className={`border-4 border-dashed rounded-full animate-spin border-sky-600 ${sizeClasses[size]}`}></div>
  );
};


interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: Array<User['role']>;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthLoading) {
      const currentPathIsAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password' || pathname.startsWith('/reset-password');

      if (!isAuthenticated && !currentPathIsAuthPage) {
        console.log(`AuthGuard: User not authenticated (pathname: ${pathname}). Redirecting to login.`);
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (isAuthenticated && allowedRoles && user && !allowedRoles.includes(user.role)) {
        console.log(`AuthGuard: User role '${user.role}' not in allowed roles [${allowedRoles.join(', ')}] (pathname: ${pathname}). Redirecting to dashboard with error.`);
        router.replace('/dashboard?error=unauthorized_role');
      } else if (isAuthenticated && currentPathIsAuthPage) {
        // If user is authenticated and tries to access login/signup, redirect to dashboard
        console.log(`AuthGuard: User authenticated but on auth page. Redirecting to dashboard.`);
        router.replace('/dashboard');
      }
    }
  }, [isAuthLoading, isAuthenticated, user, allowedRoles, router, pathname]);

  // Show loader if auth state is loading, or if user is not authenticated and not on an auth page (will be redirected)
  if (isAuthLoading || (!isAuthenticated && !(pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password' || pathname.startsWith('/reset-password')))) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900">
        <LoadingSpinner size="lg" />
        <p className="text-lg text-gray-700 dark:text-gray-300 mt-4">Authenticating...</p>
      </div>
    );
  }

  // If authenticated and has allowed role (or no specific roles required)
  if (isAuthenticated && (!allowedRoles || (user && allowedRoles.includes(user.role)))) {
    return <>{children}</>;
  }

  // If authenticated but role is not allowed (and not loading) - this should be brief due to redirect
  if (isAuthenticated && allowedRoles && user && !allowedRoles.includes(user.role)) {
     return (
         <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900">
            <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-xl">
                <h1 className="text-2xl font-semibold text-red-600 dark:text-red-500">Access Denied</h1>
                <p className="text-gray-700 dark:text-gray-300 mt-2 mb-6">You do not have the required permissions to access this page.</p>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="py-2 px-4 rounded-md text-sm font-semibold shadow-sm bg-sky-600 text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
  }

  // If none of the above, user is not authenticated but is on an auth page, so render children (the auth page itself)
  // This also covers cases where allowedRoles is not specified and user is authenticated.
  if (!isAuthenticated && (pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password' || pathname.startsWith('/reset-password'))) {
    return <>{children}</>;
  }

  // Fallback - should ideally not be reached if logic is correct
  console.warn("AuthGuard: Fallback condition reached, rendering null. This might indicate an issue.", {isAuthenticated, pathname, isLoading, user, allowedRoles});
  return null;
};

export default AuthGuard;
