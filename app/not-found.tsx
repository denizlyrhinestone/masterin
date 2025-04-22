import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="mx-auto max-w-md px-6">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="mt-4 text-3xl font-bold tracking-tight">Page not found</h2>
        <p className="mt-4 text-gray-600">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go to homepage
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/courses" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Browse courses
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
