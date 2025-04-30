"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RateLimitHandlerProps {
  error?: any
  resetAction?: () => void
}

export function RateLimitHandler({ error, resetAction }: RateLimitHandlerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  useEffect(() => {
    // Check if this is a rate limit error
    if (error?.error === "too_many_requests" && error?.retryAfter) {
      // Set initial time remaining
      setTimeRemaining(error.retryAfter)

      // Update countdown every second
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [error])

  // If this isn't a rate limit error or countdown is complete
  if (!error?.error || error.error !== "too_many_requests" || timeRemaining === 0) {
    return null
  }

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Too many attempts</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>
          For security reasons, please wait before trying again.
          {timeRemaining && timeRemaining > 0 && (
            <span className="flex items-center gap-1 mt-1">
              <Clock className="h-4 w-4" />
              <span>Try again in {formatTime(timeRemaining)}</span>
            </span>
          )}
        </p>
        {resetAction && timeRemaining === 0 && (
          <Button variant="outline" size="sm" onClick={resetAction} className="w-fit">
            Try again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
