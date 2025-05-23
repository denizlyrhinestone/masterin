import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Lightbulb, Clock, Users, BarChart, Lock } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Leverage artificial intelligence to enhance your learning experience",
    },
    {
      icon: Lightbulb,
      title: "Personalized Recommendations",
      description: "Get course recommendations tailored to your interests and goals",
    },
    {
      icon: Clock,
      title: "Learn at Your Own Pace",
      description: "Access course materials anytime, anywhere, and progress at your own speed",
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Connect with fellow learners and instructors for guidance and collaboration",
    },
    {
      icon: BarChart,
      title: "Progress Tracking",
      description: "Monitor your learning progress and achievements with detailed analytics",
    },
    {
      icon: Lock,
      title: "Secure Platform",
      description: "Your data and learning activities are protected with enterprise-grade security",
    },
  ]

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Masterin</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our platform offers a range of features designed to enhance your learning experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
