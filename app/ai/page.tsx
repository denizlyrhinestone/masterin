import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowRight,
  Brain,
  Zap,
  MessageSquare,
  BookOpen,
  LineChart,
  GraduationCap,
  Lightbulb,
  Code,
  FileText,
  Languages,
  Calculator,
} from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Tools - Masterin",
  description: "Explore our comprehensive suite of AI-powered learning tools.",
}

export default function AIPage() {
  const tools = [
    {
      id: "chat",
      title: "AI Chat",
      description: "Chat with our AI assistant to get answers to your questions",
      icon: MessageSquare,
      href: "/ai/chat",
      color: "bg-blue-500",
    },
    {
      id: "code",
      title: "Code Assistant",
      description: "Get help with coding problems and learn programming concepts",
      icon: Code,
      href: "/ai/code",
      color: "bg-green-500",
    },
    {
      id: "essay",
      title: "Essay Helper",
      description: "Get assistance with writing and structuring essays",
      icon: FileText,
      href: "/ai/essay",
      color: "bg-purple-500",
    },
    {
      id: "language",
      title: "Language Tutor",
      description: "Practice and learn new languages with AI assistance",
      icon: Languages,
      href: "/ai/language",
      color: "bg-yellow-500",
    },
    {
      id: "math",
      title: "Math Solver",
      description: "Solve math problems and understand the solutions",
      icon: Calculator,
      href: "/ai/math",
      color: "bg-red-500",
    },
    {
      id: "notes",
      title: "Study Notes",
      description: "Generate and organize study notes from your learning materials",
      icon: BookOpen,
      href: "/ai/notes",
      color: "bg-indigo-500",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            AI-Powered <span className="animate-gradient-text">Learning Tools</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Discover our comprehensive suite of AI tools designed to enhance your learning experience across all
            subjects and skill levels.
          </p>
        </div>
      </section>

      {/* AI Tools Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">AI Learning Tools</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Enhance your learning experience with our suite of AI-powered tools designed to help you master new
              skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Card key={tool.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${tool.color} flex items-center justify-center mb-4`}>
                    <tool.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={tool.href}>
                    <Button className="w-full">Try Now</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our AI Tools?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Brain className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Intelligent Adaptation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our AI learns from your interactions and adapts to your learning style for personalized assistance.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get instant responses and solutions powered by cutting-edge AI technology.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Lightbulb className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle>Creative Solutions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Generate creative content, solve complex problems, and explore new ideas with AI assistance.
                </CardDescription>
              </CardContent>
            </Card>
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
                  src="/ai-tutor-chat.png"
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
                image: "/focused-student.png",
                title: "From Struggling to Excelling",
                description:
                  "Alex improved his math grade from a C to an A- in just one semester with daily AI tutoring sessions.",
                link: "/success-stories/alex",
              },
              {
                image: "/placeholder.svg?key=9vgby",
                title: "College Admission Success",
                description:
                  "Maya used our AI tutor to prepare for her SATs and achieved a score that helped her get into her dream university.",
                link: "/success-stories/maya",
              },
              {
                image: "/focused-professional.png",
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
              <Link href="/ai/chat">
                <Button size="lg" variant="secondary" className="px-8">
                  Get Started Free
                </Button>
              </Link>
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
