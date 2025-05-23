"use client"

import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">Something went wrong</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400">An error occurred while loading this page.</p>
      <Button onClick={() => reset()} className="mt-8">
        Try again
      </Button>
    </div>
  )
}
