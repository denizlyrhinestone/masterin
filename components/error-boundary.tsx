"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Caught error:", error)
      setHasError(true)
      setError(error.error)
    }

    window.addEventListener("error", errorHandler)

    return () => {
      window.removeEventListener("error", errorHandler)
    }
  }, [])

  if (hasError) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <CardTitle>Something went wrong</CardTitle>
            </div>
            <CardDescription>We encountered an error while trying to display this page.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="rounded-md bg-muted p-4">
                <p className="font-mono text-sm">{error.message}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button asChild>
              <Link href="/">Return to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
