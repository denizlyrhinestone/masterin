import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center p-4">
      <div className="mb-6 rounded-full bg-primary/10 p-6">
        <FileQuestion className="h-16 w-16 text-primary" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/">Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild size="lg">
          <Link href="/categories">Browse Categories</Link>
        </Button>
      </div>
    </div>
  )
}
