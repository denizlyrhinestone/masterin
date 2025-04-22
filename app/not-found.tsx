import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-8 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
        <Search className="h-12 w-12 text-gray-400" />
      </div>
      <h1 className="mb-2 text-4xl font-bold">Page Not Found</h1>
      <p className="mb-8 max-w-md text-gray-600">
        We couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
      </p>
      <div className="flex flex-wrap gap-4">
        <Button asChild variant="outline" className="gap-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
