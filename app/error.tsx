"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { AlertTriangle, RefreshCcw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Unhandled error:", error)
  }, [error])

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-8 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-12 w-12 text-red-600" />
      </div>
      <h1 className="mb-2 text-4xl font-bold">Something Went Wrong</h1>
      <p className="mb-8 max-w-md text-gray-600">
        We encountered an unexpected error. Our team has been notified and is working to fix the issue.
      </p>
      <div className="flex flex-wrap gap-4">
        <Button onClick={reset} className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    </div>
  )
}
