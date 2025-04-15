"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import HeroAnimation from "@/components/hero-animation"
import TestimonialCarousel from "@/components/testimonial-carousel"
import CategoryExplorer from "@/components/category-explorer"
import { BookOpen, Users, Sparkles, GraduationCap, ChevronRight } from "lucide-react"

// Add these imports at the top
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Clock } from "lucide-react"
import { Brain } from "lucide-react"

export default function Home() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  return (
    <main className="flex flex-col min-h-screen" id="main-content">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 md:py-28">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col lg:flex-row items-center">
            <motion.div
              className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                <span>New | AI-powered learning platform</span>
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
                Master New Skills with AI-Powered Learning
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Personalized courses and expert-led instruction to accelerate your learning journey and transform your
                career
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 transform active:scale-95"
                  asChild
                >
                  <Link href="/categories">Explore Categories</Link>
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-blue-200 text-gray-400 cursor-not-allowed opacity-70"
                          disabled
                        >
                          Try AI Tutor
                          <Sparkles className="ml-2 h-4 w-4" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-800 text-white">
                      <p>Coming soon! Our AI Tutor is currently in development.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </motion.div>
            <motion.div
              className="lg:w-1/2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative w-full max-w-lg mx-auto">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-30 blur"></div>
                <div className="relative rounded-2xl overflow-hidden bg-white shadow-xl">
                  <HeroAnimation />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose LearnWise?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform combines expert instruction with cutting-edge AI technology to deliver a learning experience
              that adapts to your unique needs.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeIn}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Expert-Led Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Learn from industry professionals and academic experts who bring real-world experience to every
                    lesson.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>Real-Time AI Assistance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Get instant help from our AI tutor that answers questions, explains concepts, and guides your
                    learning 24/7.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>Personalized Learning Paths</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Our adaptive system tailors content to your skill level, learning style, and goals for maximum
                    efficiency.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-amber-600" />
                  </div>
                  <CardTitle>Community Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Connect with fellow learners in our forums and discussion groups to share insights and solve
                    problems together.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Course Categories */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Our Course Categories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Discover a wide range of subjects taught by experts and designed for effective learning
            </p>
          </motion.div>

          <CategoryExplorer variant="featured" maxCategories={5} showSearch={false} showFilters={false} />

          <div className="mt-10 text-center">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" asChild>
              <Link href="/categories">
                View All Categories <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* AI Tutor Highlight */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <motion.div
              className="lg:w-1/2 mb-10 lg:mb-0"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative w-full max-w-lg mx-auto">
                <div className="absolute -inset-1 rounded-2xl bg-white opacity-20 blur-xl"></div>
                <div className="relative rounded-2xl overflow-hidden bg-blue-800/40 shadow-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold">i-Master AI Tutor</h3>
                      <Badge variant="outline" className="bg-blue-700/50 text-blue-100 border-blue-500">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Coming Soon</span>
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-blue-700/30 rounded-lg p-4 mb-4">
                    <p className="text-blue-100 mb-2">How can I help you with your learning today?</p>
                  </div>
                  <div className="bg-blue-500/30 rounded-lg p-4 mb-4 ml-8">
                    <p className="text-blue-100 mb-2">Can you explain how neural networks work?</p>
                  </div>
                  <div className="bg-blue-700/30 rounded-lg p-4">
                    <p className="text-blue-100">
                      Neural networks are computing systems inspired by the human brain. They consist of layers of
                      interconnected nodes or "neurons" that process information. Each connection has a weight that
                      adjusts as learning proceeds...
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="lg:w-1/2 lg:pl-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Meet Your Personal AI Learning Assistant</h2>
              <p className="text-lg text-blue-100 mb-8">
                Our advanced AI tutor is currently in development and will soon provide instant answers, personalized
                explanations, and guidance whenever you need it.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Get immediate answers to your questions",
                  "Receive step-by-step explanations tailored to your level",
                  "Practice with AI-generated exercises and quizzes",
                  "Track your progress and identify knowledge gaps",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="bg-blue-500 rounded-full p-1 mr-3 mt-1">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-blue-50">{feature}</span>
                  </li>
                ))}
              </ul>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        size="lg"
                        className="bg-white/30 text-white border border-white/20 cursor-not-allowed opacity-70"
                        disabled
                      >
                        AI Tutor Coming Soon
                        <Clock className="ml-2 h-4 w-4" />
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-gray-800 text-white">
                    <p>
                      We're working hard to bring you our AI Tutor. Join our waitlist to be notified when it launches!
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Learners Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied students who have transformed their skills with LearnWise
            </p>
          </motion.div>

          <TestimonialCarousel />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Learning Journey?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join LearnWise today and experience the power of expert-led education. Get unlimited access to our growing
              library of high-quality courses.
            </p>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold mb-2">Create Free Account</h3>
                  <p className="text-gray-600 text-sm">Sign up in less than 2 minutes</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold mb-2">Explore Courses</h3>
                  <p className="text-gray-600 text-sm">Browse our extensive library</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold mb-2">Start Learning</h3>
                  <p className="text-gray-600 text-sm">With expert-led instruction</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 transform active:scale-95 shadow-lg hover:shadow-xl"
                >
                  Sign Up Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-blue-200 hover:bg-blue-50 transition-all duration-200 transform active:scale-95"
                >
                  View Pricing
                </Button>
                <Button asChild variant="outline" className="mt-4 md:mt-0 md:ml-4">
                  <Link href="/ai-dashboard">
                    <Brain className="mr-2 h-4 w-4" />
                    Try AI Learning Tools
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center mb-6">
                <GraduationCap className="h-8 w-8 text-blue-400 mr-2" />
                <span className="text-white text-xl font-bold">LearnWise</span>
              </Link>
              <p className="mb-6 text-gray-400 max-w-md">
                LearnWise is an AI-powered learning platform that combines expert-led courses with intelligent tutoring
                to help you master new skills faster and more effectively.
              </p>
              <div className="flex space-x-4">
                {["facebook", "twitter", "instagram", "linkedin", "youtube"].map((social) => (
                  <Link
                    key={social}
                    href={`https://${social}.com`}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 22c-5.523 0-10-4.477-10-10s4.477-10 10-10 10 4.477 10 10-4.477 10-10 10z" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Platform</h3>
              <ul className="space-y-2">
                {["Courses", "AI Tutor", "For Business", "For Universities", "Pricing"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                {["Blog", "Tutorials", "Documentation", "Community", "Help Center"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                {["About Us", "Careers", "Press", "Contact", "Partners"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} LearnWise. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <Link href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Cookie Policy
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
