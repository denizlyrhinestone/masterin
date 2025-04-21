import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="bg-slate-900 py-20 text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-block rounded-full bg-emerald-600/20 px-4 py-2 text-sm font-medium text-emerald-400">
            <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400"></span>
            New Feature
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Experience Our AI-Powered Learning Assistant
          </h2>
          <p className="mb-8 text-lg text-gray-300">
            Get personalized help with homework, create study plans, and receive instant feedback on your work. Our AI
            tutor is available 24/7 to support your learning journey.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 hover:shadow-lg"
            >
              <Link href="/ai-tutor">Try AI Tutor Now</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10 transition-all duration-200"
            >
              <Link href="/register">Get Started for Free</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
