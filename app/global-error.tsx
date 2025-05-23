"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Something went wrong!</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              We're sorry, but there was an error loading this page. Our team has been notified.
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded mb-6 overflow-auto max-h-40">
              <p className="text-sm font-mono text-gray-800 dark:text-gray-200">{error.message || "Unknown error"}</p>
              {error.digest && (
                <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-2">Error ID: {error.digest}</p>
              )}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => (window.location.href = "/")}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Go Home
              </button>
              <button
                onClick={() => reset()}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
