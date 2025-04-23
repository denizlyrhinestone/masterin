import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
        <h2 className="text-xl font-semibold">Loading AI Tutor...</h2>
        <p className="text-gray-500 dark:text-gray-400">Preparing your personalized learning experience</p>
      </div>
    </div>
  )
}
