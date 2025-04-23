import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, ArrowRight, Zap, BookOpen, Brain, GraduationCap, Users, Clock } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Learn Smarter with{" "}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI-Powered Education
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Personalized learning experiences that adapt to your needs. Our AI tutor helps you master concepts
                faster and retain knowledge longer.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" className="px-8">
                  Start Learning
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
                        src={`/thoughtful-artist.png?height=40&width=40&query=student ${i}`}
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
                  src="/ai-dashboard-purple-blue.png"
                  alt="AI Learning Dashboard"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-transparent"></div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs">
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
              <div className="absolute -top-6 -right-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Learn Faster</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Master concepts in less time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Featured Courses</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Explore our most popular courses with AI-enhanced learning experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Introduction to Machine Learning",
                description: "Learn the fundamentals of machine learning algorithms and applications.",
                image: "/interconnected-learning.png",
                level: "Beginner",
                duration: "8 weeks",
                students: "2,345",
                link: "/courses/machine-learning-intro",
              },
              {
                title: "Advanced Python Programming",
                description: "Master Python with advanced concepts and real-world projects.",
                image: "/python-code-snippet.png",
                level: "Intermediate",
                duration: "10 weeks",
                students: "1,876",
                link: "/courses/advanced-python",
              },
              {
                title: "Data Science Fundamentals",
                description: "Discover how to analyze and visualize data to extract meaningful insights.",
                image: "/interactive-data-dashboard.png",
                level: "Beginner",
                duration: "12 weeks",
                students: "3,210",
                link: "/courses/data-science-fundamentals",
              },
            ].map((course, index) => (
              <Card key={index} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <Image src={course.image || "/placeholder.svg"} alt={course.title} fill className="object-cover" />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{course.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs px-2 py-1 rounded-full flex items-center">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {course.level}
                    </span>
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {course.duration}
                    </span>
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {course.students} students
                    </span>
                  </div>
                  <Link href={course.link}>
                    <Button className="w-full">Enroll Now</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/courses">
              <Button variant="outline" size="lg">
                View All Courses <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">How Our AI Learning Works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Experience a revolutionary approach to education with our AI-powered learning platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="w-12 h-12 text-purple-600" />,
                title: "Personalized Learning Path",
                description:
                  "Our AI analyzes your strengths, weaknesses, and learning style to create a customized curriculum just for you.",
              },
              {
                icon: <Zap className="w-12 h-12 text-purple-600" />,
                title: "Interactive AI Tutor",
                description:
                  "Get instant help from our AI tutor that adapts to your questions and provides explanations tailored to your understanding.",
              },
              {
                icon: <GraduationCap className="w-12 h-12 text-purple-600" />,
                title: "Adaptive Assessments",
                description:
                  "Our intelligent assessment system adjusts difficulty based on your progress, ensuring optimal challenge and growth.",
              },
            ].map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="mx-auto w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Tutor Highlight Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Meet Your AI Learning Assistant</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Our AI tutor is available 24/7 to answer questions, provide explanations, and guide you through
                difficult concepts at your own pace.
              </p>

              <ul className="space-y-4">
                {[
                  "Instant answers to your questions in natural language",
                  "Step-by-step explanations of complex concepts",
                  "Practice problems tailored to your skill level",
                  "Progress tracking and personalized recommendations",
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link href="/ai">
                  <Button className="group">
                    Try AI Tutor Now
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:w-1/2 relative">
              <div className="relative rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/abstract-data-flow.png"
                  alt="AI Tutor Visualization"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "The AI tutor helped me understand calculus concepts I'd been struggling with for months. It's like having a personal teacher available whenever I need help.",
                author: "Sarah Johnson",
                role: "Computer Science Student",
                image: "/confident-leader.png",
              },
              {
                quote:
                  "As a working professional, I needed flexible learning options. This platform lets me study at my own pace with AI guidance that adapts to my schedule and learning style.",
                author: "Michael Chen",
                role: "Software Engineer",
                image: "/confident-asian-professional.png",
              },
              {
                quote:
                  "The personalized learning path identified gaps in my knowledge I didn't know existed. Now I'm making faster progress and actually enjoying the learning process!",
                author: "Jessica Williams",
                role: "Data Science Student",
                image: "/confident-professional.png",
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

      {/* For Educators Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">For Educators</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Empower your teaching with AI tools designed to reduce workload and enhance student outcomes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-4">AI-Powered Teaching Assistant</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Let our AI handle routine questions, grade assignments, and provide initial feedback, freeing you to
                  focus on what matters most: meaningful interactions with your students.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Automated grading with detailed feedback</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Personalized content generation for different learning levels</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Student progress analytics and intervention recommendations</span>
                  </li>
                </ul>
                <Link href="/for-educators">
                  <Button>Learn More</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-4">Course Creation Tools</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Create engaging, interactive course content with our AI-powered authoring tools. Generate quizzes,
                  simulations, and multimedia materials in minutes, not hours.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>AI-generated quiz questions and practice problems</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Interactive simulations and visualizations</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>Curriculum mapping and learning objective alignment</span>
                  </li>
                </ul>
                <Link href="/course-creation">
                  <Button>Explore Tools</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-purple-600 text-white">
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
