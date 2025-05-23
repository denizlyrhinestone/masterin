import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About - Masterin",
  description: "Learn about our mission and vision",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">About Masterin</h1>
          <p className="text-lg mb-6">
            Masterin is an AI-powered learning platform designed to enhance your educational experience.
          </p>
          <p className="mb-6">
            Our mission is to make education more accessible, personalized, and effective through the power of
            artificial intelligence.
          </p>
          <p className="mb-6">
            We offer a range of AI tools and courses to help students, educators, and professionals achieve their
            learning goals.
          </p>
        </div>
      </div>
    </div>
  )
}
