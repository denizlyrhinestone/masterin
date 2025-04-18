import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center p-4">
      <div className="mb-6 rounded-full bg-destructive/10 p-6">
        <ShieldAlert className="h-16 w-16 text-destructive" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-2">Unauthorized Access</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        You don't have permission to access this page. Please sign in with the appropriate account or contact an
        administrator.
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild size="lg">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    </div>
  )
}
