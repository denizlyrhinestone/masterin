import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Brain, Zap, MessageSquare, BookOpen, LineChart, GraduationCap } from "lucide-react"

export default function AIPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-20 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Your Personal{" "}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI Tutor
                </span>{" "}
                Available 24/7
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Get instant help with any subject, personalized explanations, and practice problems tailored to your
                learning style and pace.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" className="px-8">
                  Try AI Tutor Now
                </Button>
                <Button size="lg" variant="outline" className="px-8">
                  How It Works
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/placeholder.svg?height=600&width=800&query=AI tutor helping student with purple interface"
                  alt="AI Tutor Visualization"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Tutor Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">How Our AI Tutor Helps You Learn</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Our advanced AI tutor adapts to your learning style and needs to provide personalized educational support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageSquare className="w-10 h-10 text-purple-600" />,
                title: "Instant Answers & Explanations",
                description:
                  "Get immediate responses to your questions with step-by-step explanations tailored to your level of understanding.",
                link: "/ai/chat",
              },
              {
                icon: <BookOpen className="w-10 h-10 text-purple-600" />,
                title: "Personalized Study Plans",
                description:
                  "Receive customized learning paths based on your goals, strengths, and areas for improvement.",
                link: "/ai/study-plans",
              },
              {
                icon: <Brain className="w-10 h-10 text-purple-600" />,
                title: "Concept Mastery",
                description:
                  "Our AI identifies knowledge gaps and provides targeted practice to ensure complete understanding of key concepts.",
                link: "/ai/concept-mastery",
              },
              {
                icon: <LineChart className="w-10 h-10 text-purple-600" />,
                title: "Progress Tracking",
                description:
                  "Monitor your learning journey with detailed analytics and insights on your improvement over time.",
                link: "/ai/progress",
              },
              {
                icon: <GraduationCap className="w-10 h-10 text-purple-600" />,
                title: "Exam Preparation",
                description: "Get specialized help preparing for tests with practice questions and simulated exams.",
                link: "/ai/exam-prep",
              },
              {
                icon: <Zap className="w-10 h-10 text-purple-600" />,
                title: "Learning Acceleration",
                description: "Master concepts faster with AI-optimized learning techniques and spaced repetition.",
                link: "/ai/acceleration",
              },
            ].map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{feature.description}</p>
                  <Link href={feature.link}>
                    <Button variant="ghost" className="p-0 h-auto group">
                      Learn More <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">How Our AI Tutor Works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Experience a revolutionary approach to learning with our advanced AI technology
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
                  src="/placeholder.svg?height=600&width=800&query=AI tutor interface with student conversation"
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

      {/* Subject Areas Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Subjects We Cover</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Our AI tutor can help you with a wide range of subjects and topics
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              "Mathematics",
              "Physics",
              "Chemistry",
              "Biology",
              "Computer Science",
              "Statistics",
              "Economics",
              "History",
              "Literature",
              "Psychology",
              "Engineering",
              "Data Science",
              "Foreign Languages",
              "Business",
              "Art & Design",
              "Music Theory",
            ].map((subject, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-4 text-center">
                  <h3 className="font-medium">{subject}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Student Success Stories */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Student Success Stories</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              See how our AI tutor has helped students achieve their academic goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                image: "/placeholder.svg?height=300&width=500&query=student studying with laptop",
                title: "From Struggling to Excelling",
                description:
                  "Alex improved his math grade from a C to an A- in just one semester with daily AI tutoring sessions.",
                link: "/success-stories/alex",
              },
              {
                image: "/placeholder.svg?height=300&width=500&query=student graduation ceremony",
                title: "College Admission Success",
                description:
                  "Maya used our AI tutor to prepare for her SATs and achieved a score that helped her get into her dream university.",
                link: "/success-stories/maya",
              },
              {
                image: "/placeholder.svg?height=300&width=500&query=professional working on computer",
                title: "Career Transition",
                description:
                  "James used our platform to learn programming and successfully switched careers to become a software developer.",
                link: "/success-stories/james",
              },
            ].map((story, index) => (
              <Card key={index} className="border-0 shadow-lg overflow-hidden">
                <div className="relative h-48">
                  <Image src={story.image || "/placeholder.svg"} alt={story.title} fill className="object-cover" />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{story.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{story.description}</p>
                  <Link href={story.link}>
                    <Button variant="ghost" className="p-0 h-auto group">
                      Read Full Story{" "}
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Get answers to common questions about our AI tutor
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {[
                {
                  question: "How does the AI tutor work?",
                  answer:
                    "Our AI tutor uses advanced natural language processing and machine learning to understand your questions, provide personalized explanations, and adapt to your learning style. It analyzes your responses to identify knowledge gaps and adjusts its teaching approach accordingly.",
                },
                {
                  question: "What subjects does the AI tutor cover?",
                  answer:
                    "Our AI tutor covers a wide range of subjects including mathematics, science, computer programming, humanities, languages, and more. It's constantly learning and expanding its knowledge base to provide comprehensive support across disciplines.",
                },
                {
                  question: "Is the AI tutor suitable for all learning levels?",
                  answer:
                    "Yes, our AI tutor adapts to various learning levels from elementary school to university and professional development. It tailors explanations and practice problems based on your current understanding and gradually increases complexity as you progress.",
                },
                {
                  question: "How accurate is the AI tutor's information?",
                  answer:
                    "Our AI tutor is trained on high-quality educational resources and regularly updated with the latest information. While it strives for accuracy, we recommend verifying critical information with official textbooks or instructors, especially for specialized or advanced topics.",
                },
                {
                  question: "Can the AI tutor help with homework and assignments?",
                  answer:
                    "The AI tutor can help you understand concepts, provide explanations, and guide you through problem-solving approaches. However, it's designed to support learning rather than complete assignments for you. It encourages critical thinking and independent problem-solving skills.",
                },
              ].map((faq, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Learning Experience?</h2>
            <p className="text-xl mb-8 text-purple-100">
              Start learning with your personal AI tutor today and experience the future of education.
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
                Explore Courses
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
