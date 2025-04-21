import { BookOpen, Brain, BarChart3, Users, Award } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: <BookOpen className="h-10 w-10 text-emerald-600" />,
    title: "Comprehensive Curriculum",
    description: "Access a wide range of subjects with structured learning paths designed by educational experts.",
  },
  {
    icon: <Brain className="h-10 w-10 text-emerald-600" />,
    title: "AI-Powered Learning",
    description:
      "Our intelligent system adapts to your learning style and pace, providing personalized recommendations.",
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-emerald-600" />,
    title: "Progress Analytics",
    description: "Track your learning journey with detailed analytics and insights to optimize your study time.",
  },
  {
    icon: <Users className="h-10 w-10 text-emerald-600" />,
    title: "Collaborative Learning",
    description: "Connect with peers and educators in a supportive community environment that enhances learning.",
  },
  {
    icon: <Award className="h-10 w-10 text-emerald-600" />,
    title: "Verified Educators",
    description: "Learn from qualified and verified educators who are passionate about their subjects.",
  },
]

export function FeatureSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Why Choose Masterin</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Our platform combines cutting-edge technology with expert education to provide an unparalleled learning
            experience.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md",
                feature.title === "AI-Powered Learning" &&
                  "border-emerald-200 bg-emerald-50/50 ring-1 ring-emerald-500/20",
              )}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3
                className={cn(
                  "mb-2 text-xl font-semibold",
                  feature.title === "AI-Powered Learning" ? "text-emerald-700" : "text-gray-900",
                )}
              >
                {feature.title}
                {feature.title === "AI-Powered Learning" && (
                  <span className="ml-2 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                    New
                  </span>
                )}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
              {feature.title === "AI-Powered Learning" && (
                <div className="mt-4">
                  <Link
                    href="/ai-tutor"
                    className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
                  >
                    Try AI Tutor
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
