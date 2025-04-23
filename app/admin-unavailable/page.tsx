import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminUnavailablePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="max-w-md text-center">
        <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Admin Functionality Unavailable</h1>
        <p className="text-muted-foreground mb-8">
          The admin functionality is currently unavailable because the ADMIN_EMAIL environment variable is not properly
          configured.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Please contact your system administrator to resolve this issue.
        </p>
        <Button asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  )
}
