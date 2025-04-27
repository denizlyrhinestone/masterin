import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Clock, Users, Star, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import CourseVideoPreview from "@/components/course-video-preview"

export default function CoursesPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Explore Our{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Courses
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Discover a wide range of courses enhanced with AI-powered learning tools to help you master new skills
            </p>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mt-8">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input type="text" placeholder="Search courses..." className="pl-10" />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">Top Courses</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Web Development Bootcamp",
                description: "A comprehensive course covering HTML, CSS, JavaScript, and modern frameworks.",
                image: "/course-web-development.png",
                videoUrl: "/videos/web-development-preview.mp4",
                level: "Beginner to Intermediate",
                duration: "16 weeks",
                students: "5,432",
                rating: 4.9,
                instructor: "Jessica Williams",
                price: "$79.99",
                link: "/courses/web-development-bootcamp",
              },
              {
                title: "Artificial Intelligence Fundamentals",
                description: "Learn the core concepts of AI, machine learning, and neural networks.",
                image: "/course-ai-fundamentals.png",
                videoUrl: "/videos/ai-fundamentals-preview.mp4",
                level: "Intermediate",
                duration: "12 weeks",
                students: "4,123",
                rating: 4.8,
                instructor: "Dr. Michael Rodriguez",
                price: "$69.99",
                link: "/courses/ai-fundamentals",
              },
              {
                title: "Digital Marketing Mastery",
                description: "Master digital marketing strategies, SEO, social media, and analytics.",
                image: "/course-digital-marketing.png",
                videoUrl: "/videos/digital-marketing-preview.mp4",
                level: "All Levels",
                duration: "10 weeks",
                students: "3,987",
                rating: 4.7,
                instructor: "Emma Thompson",
                price: "$59.99",
                link: "/courses/digital-marketing",
              },
            ].map((course, index) => (
              <Card key={index} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index < 3}
                  />
                  <CourseVideoPreview title={course.title} videoUrl={course.videoUrl} thumbnailUrl={course.image} />
                  <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full px-2 py-1 text-xs font-semibold flex items-center">
                    <Star className="h-3 w-3 text-yellow-400 mr-1" fill="currentColor" />
                    {course.rating}
                  </div>
                </div>
                <CardContent className="p-6">
                  <Link href={course.link}>
                    <h3 className="text-xl font-semibold mb-2 hover:text-purple-600 transition-colors">
                      {course.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{course.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Instructor: {course.instructor}</p>
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
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">{course.price}</span>
                    <Link href={course.link}>
                      <Button>Enroll Now</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">Featured Courses</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Introduction to Machine Learning",
                description: "Learn the fundamentals of machine learning algorithms and applications.",
                image: "/course-machine-learning.png",
                videoUrl: "/videos/machine-learning-preview.mp4",
                level: "Beginner",
                duration: "8 weeks",
                students: "2,345",
                rating: 4.8,
                instructor: "Dr. Sarah Chen",
                price: "$49.99",
                link: "/courses/machine-learning-intro",
              },
              {
                title: "Advanced Python Programming",
                description: "Master Python with advanced concepts and real-world projects.",
                image: "/course-python-programming.png",
                videoUrl: "/videos/python-programming-preview.mp4",
                level: "Intermediate",
                duration: "10 weeks",
                students: "1,876",
                rating: 4.7,
                instructor: "Michael Rodriguez",
                price: "$59.99",
                link: "/courses/advanced-python",
              },
              {
                title: "Data Science Fundamentals",
                description: "Discover how to analyze and visualize data to extract meaningful insights.",
                image: "/course-data-science.png",
                videoUrl: "/videos/data-science-preview.mp4",
                level: "Beginner",
                duration: "12 weeks",
                students: "3,210",
                rating: 4.9,
                instructor: "Dr. Alex Johnson",
                price: "$49.99",
                link: "/courses/data-science-fundamentals",
              },
            ].map((course, index) => (
              <Card key={index} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <CourseVideoPreview title={course.title} videoUrl={course.videoUrl} thumbnailUrl={course.image} />
                  <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full px-2 py-1 text-xs font-semibold flex items-center">
                    <Star className="h-3 w-3 text-yellow-400 mr-1" fill="currentColor" />
                    {course.rating}
                  </div>
                </div>
                <CardContent className="p-6">
                  <Link href={course.link}>
                    <h3 className="text-xl font-semibold mb-2 hover:text-purple-600 transition-colors">
                      {course.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{course.description}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Instructor: {course.instructor}</p>
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
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">{course.price}</span>
                    <Link href={course.link}>
                      <Button>Enroll Now</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Course Categories */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">Browse by Category</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Computer Science",
                count: 42,
                icon: "/category-computer-science.png",
                link: "/courses/category/computer-science",
              },
              {
                name: "Data Science",
                count: 38,
                icon: "/category-data-science.png",
                link: "/courses/category/data-science",
              },
              {
                name: "Mathematics",
                count: 29,
                icon: "/category-mathematics.png",
                link: "/courses/category/mathematics",
              },
              {
                name: "Business",
                count: 35,
                icon: "/category-business.png",
                link: "/courses/category/business",
              },
              {
                name: "Language Learning",
                count: 27,
                icon: "/category-language.png",
                link: "/courses/category/languages",
              },
              {
                name: "Science",
                count: 31,
                icon: "/category-science.png",
                link: "/courses/category/science",
              },
              {
                name: "Arts & Design",
                count: 24,
                icon: "/category-arts-design.png",
                link: "/courses/category/arts",
              },
              {
                name: "Personal Development",
                count: 19,
                icon: "/category-personal-development.png",
                link: "/courses/category/personal-development",
              },
            ].map((category, index) => (
              <Link href={category.link} key={index}>
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6 flex items-center">
                    <div className="w-12 h-12 mr-4 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={category.icon || "/placeholder.svg"}
                        alt={category.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{category.count} courses</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">What Our Students Say</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Hear from students who have transformed their learning with our courses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "The AI-enhanced learning experience was incredible. I could ask questions anytime and get immediate, personalized help that really improved my understanding.",
                author: "John Smith",
                role: "Web Development Student",
                image: "/testimonial-student-1.png",
              },
              {
                quote:
                  "As someone with a busy schedule, the flexibility of these courses combined with the AI tutor made it possible for me to learn at my own pace without sacrificing quality.",
                author: "Emily Chen",
                role: "Data Science Student",
                image: "/testimonial-student-2.png",
              },
              {
                quote:
                  "The interactive exercises and real-time feedback helped me master concepts much faster than traditional courses. The AI tutor felt like having a personal instructor.",
                author: "Michael Johnson",
                role: "AI Fundamentals Student",
                image: "/testimonial-student-3.png",
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
                        className="object-cover"
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
      <section className="py-16 bg-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Learning?</h2>
            <p className="text-xl mb-8 text-purple-100">
              Join thousands of students already experiencing our AI-enhanced courses.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" variant="secondary" className="px-8">
                Browse All Courses
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 border-white text-white hover:bg-white hover:text-purple-600"
              >
                Try Free Lessons
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
