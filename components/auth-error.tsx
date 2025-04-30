import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { StandardError } from "@/lib/error-handling"

interface AuthErrorProps {
  error: StandardError | null | undefined
  className?: string
}

export function AuthError({ error, className = "" }: AuthErrorProps) {
  if (!error) return null

  return (
    <Alert variant="destructive" className={`mb-4 ${className}`}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  )
}
