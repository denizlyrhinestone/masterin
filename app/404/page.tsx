import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page Not Found - Masterin",
  description: "The page you are looking for could not be found.",
}

// Static 404 page with no client components or hooks
export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-600 mb-6">Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <a href="/" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
        Return to Homepage
      </a>
    </div>
  )
}
