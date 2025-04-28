import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Zap, ArrowRight } from "lucide-react"
import AIToolsSection from "@/components/ai-tools-section"
import FreeTrialBanner from "@/components/free-trial-banner"
import AIChatWidget from "@/components/ai-chat-widget"
import HeroSlider from "@/components/hero-slider"

export default function Home() {
  // Hero slider content
  const heroSlides = [
    {
      title: "Learn Smarter with AI-Powered Education",
      description:
        "Experience the future of learning with our suite of AI tools designed to help you master concepts faster, get instant answers, and personalize your educational journey.",
      image: "/ai-education-purple-dashboard.png",
      cta: {
        text: "Try AI Tools Now",
        link: "/ai",
      },
    },
    {
      title: "Get Instant Answers to Any Question",
      description:
        "Our AI tutor is available 24/7 to help you with any subject. Ask questions, upload problems, and get detailed explanations instantly.",
      image: "/ai-tutor-interaction.png",
      cta: {
        text: "Chat with AI Tutor",
        link: "/ai/chat",
      },
    },
    {
      title: "Personalized Learning Paths",
      description:
        "Everyone learns differently. Our AI adapts to your learning style, pace, and goals to create a customized educational experience.",
      image: "/personalized-learning-dashboard.png",
      cta: {
        text: "Discover Your Path",
        link: "/courses",
      },
    },
    {
      title: "Join a Community of Learners",
      description:
        "Connect with students and educators worldwide. Share knowledge, collaborate on projects, and grow together.",
      image: "/diverse-students-studying.png",
      cta: {
        text: "Join Community",
        link: "/contact",
      },
    },
  ]

  return (
    <div className="flex flex-col w-full">
      {/* Dynamic Hero Section with Slider */}
      <HeroSlider slides={heroSlides} />

      {/* Free Trial Banner */}
      <FreeTrialBanner checkClientSide={true} />

      {/* AI Chat Integration Section - REFACTORED TO 20/80 SPLIT */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/10 dark:to-indigo-950/10 opacity-70"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25px 25px, rgba(128, 90, 213, 0.1) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(79, 70, 229, 0.1) 2%, transparent 0%)",
            backgroundSize: "100px 100px",
          }}
        ></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Content section - 20% width */}
            <div className="lg:w-1/5 lg:sticky lg:top-24">
              <Badge className="mb-4 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30">
                Featured Tool
              </Badge>
              <h2 className="text-2xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Try our AI Tutor
                </span>
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Ask any question and get instant, detailed explanations tailored to your learning style.
              </p>

              <ul className="space-y-2 mb-4 text-sm">
                <li className="flex items-start">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-1.5 mt-0.5">
                    <CheckCircle className="w-2 h-2 text-green-600" />
                  </div>
                  <span>Ask in natural language</span>
                </li>
                <li className="flex items-start">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-1.5 mt-0.5">
                    <CheckCircle className="w-2 h-2 text-green-600" />
                  </div>
                  <span>Get step-by-step help</span>
                </li>
                <li className="flex items-start">
                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-1.5 mt-0.5">
                    <CheckCircle className="w-2 h-2 text-green-600" />
                  </div>
                  <span>Upload images of problems</span>
                </li>
              </ul>

              <Link href="/ai">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group border-purple-600 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-950/30"
                >
                  More AI Tools
                  <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Chat widget section - 80% width */}
            <div className="lg:w-4/5 mt-8 lg:mt-0">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                <AIChatWidget expanded={true} />
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
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
