// src/app/(auth)/layout.tsx
import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" legacyBehavior>
            <a className="inline-block">
              {/* Replace with your actual logo if you have one */}
              {/* <img className="mx-auto h-12 w-auto" src="/logo-placeholder.svg" alt="MasterIn.org" /> */}
              <h1 className="text-4xl font-bold text-sky-600 hover:text-sky-700 transition-colors">
                MasterIn.org
              </h1>
            </a>
          </Link>
        </div>
        <div className="bg-white dark:bg-slate-800 shadow-xl rounded-xl p-8 sm:p-10 space-y-6 border border-slate-200 dark:border-slate-700">
            {children}
        </div>
        <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            <Link href="/" legacyBehavior>
                <a className="font-medium text-sky-600 hover:text-sky-500 hover:underline">
                    &larr; Back to Homepage
                </a>
            </Link>
        </p>
      </div>
    </div>
  );
}
