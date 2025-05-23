import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-16 bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Learning Experience?</h2>
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Join thousands of students and professionals who are already using Masterin to enhance their education.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/auth/sign-up">
            <Button size="lg" className="bg-white text-purple-900 hover:bg-white/90">
              Get Started
            </Button>
          </Link>
          <Link href="/courses">
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              Explore Courses
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
