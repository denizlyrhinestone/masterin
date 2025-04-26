"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { logError } from "@/lib/error-logger"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
    logError(error, {
      severity: "high",
      context: { component: "ErrorPage", digest: error.digest },
    })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center text-center mb-6">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Application Error</h1>
          <p className="text-gray-600 dark:text-gray-300">
            We've encountered an unexpected error. Please try refreshing the page.
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
          <h2 className="text-red-800 dark:text-red-400 font-medium mb-2">Error Details</h2>
          <div className="text-red-700 dark:text-red-300 font-mono text-xs overflow-auto max-h-40">
            {error.message || "An unexpected error occurred"}
            {error.digest && <div className="mt-2">Error ID: {error.digest}</div>}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button onClick={reset} className="w-full flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="w-full flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Return to Home
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">If this problem persists, please contact support.</p>
        </div>
      </div>
    </div>
  )
}
