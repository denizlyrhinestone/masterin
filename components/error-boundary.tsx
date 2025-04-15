"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function ErrorBoundary({
  children,
}: {
  children: React.ReactNode
}) {
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("Global error caught:", error)
      setError(error.error)
    }

    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <h2 className="mt-4 text-xl font-semibold">Something went wrong!</h2>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">{error.message || "An unexpected error occurred"}</p>
          <Button
            size="sm"
            onClick={() => {
              setError(null)
              window.location.reload()
            }}
          >
            Try again
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
