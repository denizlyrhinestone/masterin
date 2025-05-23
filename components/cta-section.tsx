"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Learning Experience?</h2>
        <p className="text-xl mb-8 text-purple-100 max-w-3xl mx-auto">
          Join thousands of students already using our AI-powered platform to learn faster and more effectively.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/auth/sign-up">
            <Button size="lg" variant="secondary" className="px-8">
              Get Started Free
            </Button>
          </Link>
          <Link href="/about">
            <Button
              size="lg"
              variant="outline"
              className="px-8 bg-transparent text-white border-white hover:bg-white/10"
            >
              Learn More
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
