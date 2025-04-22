"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle, Home, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="mx-auto max-w-md px-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
        </div>
        <h1 className="mt-6 text-3xl font-bold">Something went wrong</h1>
        <p className="mt-4 text-gray-600">
          We apologize for the inconvenience. The application encountered an unexpected error.
        </p>
        {error.message && (
          <div className="mt-6 rounded-md bg-red-50 p-4 text-left">
            <p className="text-sm font-medium text-red-800">Error details:</p>
            <p className="mt-1 text-sm text-red-700">{error.message}</p>
          </div>
        )}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button onClick={reset} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go to homepage
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
