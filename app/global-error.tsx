"use client"

import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <h1 className="text-4xl font-bold text-red-600 dark:text-red-400">Something went wrong!</h1>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            An unexpected error occurred. Our team has been notified.
          </p>
          <Button onClick={() => reset()} className="mt-8">
            Try again
          </Button>
        </div>
      </body>
    </html>
  )
}
