import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Zap, Brain } from "lucide-react"
import AIToolsSection from "@/components/ai-tools-section"
import FreeTrialBanner from "@/components/free-trial-banner"

export default function Home() {
  // Remove any server-side cookie checking
  // Let the FreeTrialBanner component handle this client-side

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-purple-900/20 -z-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
              <Badge className="mb-4 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30">
                New AI Tools Available
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Learn Smarter with{" "}
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  AI-Powered Education
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Experience the future of learning with our suite of AI tools designed to help you master concepts
                faster, get instant answers, and personalize your educational journey.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" className="px-8">
                  Try AI Tools Now
                </Button>
                <Button size="lg" variant="outline" className="px-8">
                  Explore Courses
                </Button>
              </div>
              <div className="mt-10 flex items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 overflow-hidden bg-gray-200"
                    >
                      <Image
                        src={`/diverse-students-studying.png?height=40&width=40&query=student ${i}`}
                        alt={`Student ${i}`}
                        width={40}
                        height={40}
                      />
                    </div>
                  ))}
                </div>
                <div className="ml-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">4.9/5</span> from over 10,000 students
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/ai-education-purple-dashboard.png"
                  alt="AI Learning Dashboard"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-transparent"></div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs animate-float">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">AI-Powered Learning</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Personalized to your learning style</p>
                  </div>
                </div>
              </div>
              <div
                className="absolute -top-6 -right-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs animate-float"
                style={{ animationDelay: "1s" }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Instant Answers</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Get help when you need it</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Free Trial Banner - now checking cookies client-side */}
      <FreeTrialBanner checkClientSide={true} />

      {/* Rest of the page content... */}
      {/* ... */}
      {/* AI Tools Section */}
      <AIToolsSection />

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">How Our AI Learning Works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Experience a revolutionary approach to education with our AI-powered learning platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="space-y-12">
                {[
                  {
                    number: "01",
                    title: "Ask Any Question",
                    description:
                      "Type your question in natural language, upload an image of a problem, or even speak to your AI tutor.",
                  },
                  {
                    number: "02",
                    title: "Receive Personalized Explanations",
                    description: "Get clear, step-by-step explanations tailored to your learning level and style.",
                  },
                  {
                    number: "03",
                    title: "Practice with Interactive Problems",
                    description: "Reinforce your understanding with practice problems that adapt to your skill level.",
                  },
                  {
                    number: "04",
                    title: "Track Your Progress",
                    description:
                      "Monitor your improvement over time with detailed analytics and personalized recommendations.",
                  },
                ].map((step, index) => (
                  <div key={index} className="flex">
                    <div className="flex-shrink-0 mr-6">
                      <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold">
                        {step.number}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/ai-tutor-interaction.png"
                  alt="AI Tutor Interface"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Instant Feedback</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Learn from your mistakes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Choose Your Learning Plan</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Get started for free or unlock unlimited access with our premium plans
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Free Trial</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-gray-500 dark:text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "5 AI tutor questions per day",
                    "Basic concept explanations",
                    "Limited subject coverage",
                    "24-hour chat history",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Start Free
                </Button>
              </CardFooter>
            </Card>

            {/* Premium Plan */}
            <Card className="border-0 shadow-xl relative bg-gradient-to-b from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 transform scale-105">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle>Premium</CardTitle>
                <CardDescription>For serious learners</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$9.99</span>
                  <span className="text-gray-500 dark:text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Unlimited AI tutor questions",
                    "Detailed explanations with examples",
                    "All subjects covered",
                    "File upload for problem solving",
                    "Personalized study plans",
                    "Unlimited chat history",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Get Premium</Button>
              </CardFooter>
            </Card>

            {/* Team Plan */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Team</CardTitle>
                <CardDescription>For schools and organizations</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$29.99</span>
                  <span className="text-gray-500 dark:text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "Everything in Premium",
                    "Up to 10 user accounts",
                    "Team analytics dashboard",
                    "Custom curriculum integration",
                    "Priority support",
                    "Admin controls",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Contact Sales
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">What Our Students Say</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Hear from students who have transformed their learning experience with our AI-powered platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "The AI tutor helped me understand calculus concepts I'd been struggling with for months. It's like having a personal teacher available whenever I need help.",
                author: "Sarah Johnson",
                role: "Computer Science Student",
                image: "/focused-scholar.png",
              },
              {
                quote:
                  "As a working professional, I needed flexible learning options. This platform lets me study at my own pace with AI guidance that adapts to my schedule and learning style.",
                author: "Michael Chen",
                role: "Software Engineer",
                image: "/confident-professional.png",
              },
              {
                quote:
                  "The personalized learning path identified gaps in my knowledge I didn't know existed. Now I'm making faster progress and actually enjoying the learning process!",
                author: "Jessica Williams",
                role: "Data Science Student",
                image: "/focused-analyst.png",
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                      <Image
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.author}
                        width={48}
                        height={48}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.author}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Learning Experience?</h2>
            <p className="text-xl mb-8 text-purple-100">
              Join thousands of students already using our AI-powered platform to learn faster and more effectively.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" variant="secondary" className="px-8">
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 border-white text-white hover:bg-white hover:text-purple-600"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
