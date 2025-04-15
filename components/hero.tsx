import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="container mx-auto px-4 py-24 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Learn Smarter with AI-Powered Education</h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl">
          Discover personalized learning paths, interactive courses, and AI-assisted tutoring to accelerate your
          educational journey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-gray-100">
            <Link href="/courses">Explore Courses</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
            <Link href="/ai-tutor">Try AI Tutor</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
