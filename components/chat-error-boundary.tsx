"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

interface ChatErrorFallbackProps {
  resetErrorBoundary: () => void
  error: Error
}

export function ChatErrorFallback({ resetErrorBoundary, error }: ChatErrorFallbackProps) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      resetErrorBoundary()
    }
  }, [countdown, resetErrorBoundary])

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
      <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
      <h2 className="text-xl font-bold mb-2">Chat Error</h2>
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Error Details</AlertTitle>
        <AlertDescription>{error.message || "An unexpected error occurred in the chat interface"}</AlertDescription>
      </Alert>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Auto-recovering in {countdown} seconds...</p>
      <div className="flex gap-4">
        <Button onClick={resetErrorBoundary} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Reset Now
        </Button>
        <Button variant="outline" onClick={() => router.push("/")}>
          Return to Home
        </Button>
      </div>
    </div>
  )
}
