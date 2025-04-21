import { BookOpen, Brain, BarChart3, Users, Award } from "lucide-react"

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
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
