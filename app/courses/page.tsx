"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, Filter, Star, ChevronRight } from "lucide-react"

// Course categories data
const courseCategories = [
  {
    name: "Technology",
    slug: "technology",
    image: "/placeholder.svg?height=160&width=320&text=Technology",
    icon: <BookOpen className="h-5 w-5 text-blue-600" />,
    count: 42,
  },
  {
    name: "Business",
    slug: "business",
    image: "/placeholder.svg?height=160&width=320&text=Business",
    icon: <BookOpen className="h-5 w-5 text-purple-600" />,
    count: 38,
  },
  {
    name: "Art & Design",
    slug: "art-design",
    image: "/placeholder.svg?height=160&width=320&text=Art+%26+Design",
    icon: <BookOpen className="h-5 w-5 text-pink-600" />,
    count: 25,
  },
  {
    name: "Data Science",
    slug: "data-science",
    image: "/placeholder.svg?height=160&width=320&text=Data+Science",
    icon: <BookOpen className="h-5 w-5 text-green-600" />,
    count: 31,
  },
  {
    name: "Languages",
    slug: "languages",
    image: "/placeholder.svg?height=160&width=320&text=Languages",
    icon: <BookOpen className="h-5 w-5 text-orange-600" />,
    count: 28,
  },
  {
    name: "Academics",
    slug: "academics",
    image: "/placeholder.svg?height=160&width=320&text=Academics",
    icon: <BookOpen className="h-5 w-5 text-indigo-600" />,
    count: 35,
  },
  {
    name: "Photography",
    slug: "photography",
    image: "/placeholder.svg?height=160&width=320&text=Photography",
    icon: <BookOpen className="h-5 w-5 text-cyan-600" />,
    count: 19,
  },
  {
    name: "Music",
    slug: "music",
    image: "/placeholder.svg?height=160&width=320&text=Music",
    icon: <BookOpen className="h-5 w-5 text-red-600" />,
    count: 22,
  },
]

// Featured courses data
const featuredCourses = [
  {
    id: 1,
    title: "Complete Web Development Bootcamp",
    slug: "web-development-bootcamp",
    category: "Technology",
    categorySlug: "technology",
    image: "/placeholder.svg?height=200&width=400&text=Web+Development",
    instructor: "Sarah Johnson",
    rating: 4.9,
    reviewCount: 2453,
    level: "Beginner to Advanced",
    duration: "12 weeks",
    description:
      "Learn HTML, CSS, JavaScript, React, Node.js and more. Build real-world projects and deploy them to the web.",
    featured: true,
  },
  {
    id: 2,
    title: "Data Science Fundamentals",
    slug: "data-science-fundamentals",
    category: "Data Science",
    categorySlug: "data-science",
    image: "/placeholder.svg?height=200&width=400&text=Data+Science",
    instructor: "Michael Chen",
    rating: 4.8,
    reviewCount: 1872,
    level: "Intermediate",
    duration: "8 weeks",
    description:
      "Master the essentials of data analysis, visualization, and machine learning with Python and real-world datasets.",
    featured: true,
  },
  {
    id: 3,
    title: "Digital Marketing Masterclass",
    slug: "digital-marketing-masterclass",
    category: "Business",
    categorySlug: "business",
    image: "/placeholder.svg?height=200&width=400&text=Digital+Marketing",
    instructor: "Emily Rodriguez",
    rating: 4.7,
    reviewCount: 1563,
    level: "All Levels",
    duration: "6 weeks",
    description: "Learn SEO, social media marketing, email campaigns, and analytics to grow your business online.",
    featured: true,
  },
  {
    id: 4,
    title: "UI/UX Design Principles",
    slug: "ui-ux-design-principles",
    category: "Art & Design",
    categorySlug: "art-design",
    image: "/placeholder.svg?height=200&width=400&text=UI/UX+Design",
    instructor: "David Okafor",
    rating: 4.9,
    reviewCount: 1247,
    level: "Beginner",
    duration: "10 weeks",
    description:
      "Learn the fundamentals of user interface and user experience design. Create beautiful, functional designs.",
    featured: true,
  },
  {
    id: 5,
    title: "Python Programming for Beginners",
    slug: "python-programming-beginners",
    category: "Technology",
    categorySlug: "technology",
    image: "/placeholder.svg?height=200&width=400&text=Python+Programming",
    instructor: "Priya Sharma",
    rating: 4.8,
    reviewCount: 2156,
    level: "Beginner",
    duration: "6 weeks",
    description:
      "Start your programming journey with Python. Learn syntax, data structures, and build practical applications.",
    featured: false,
  },
  {
    id: 6,
    title: "Financial Planning and Investment",
    slug: "financial-planning-investment",
    category: "Business",
    categorySlug: "business",
    image: "/placeholder.svg?height=200&width=400&text=Financial+Planning",
    instructor: "James Wilson",
    rating: 4.7,
    reviewCount: 983,
    level: "Intermediate",
    duration: "8 weeks",
    description:
      "Learn how to manage personal finances, invest in stocks, bonds, and real estate, and plan for retirement.",
    featured: false,
  },
]

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCourses = featuredCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <main className="flex flex-col min-h-screen" id="main-content">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Discover Your Next Learning Adventure</h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              Explore thousands of courses taught by expert instructors across a wide range of subjects
            </p>
            <div className="relative max-w-xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search for courses, categories, or skills..."
                className="pl-10 py-6 text-gray-900 rounded-lg w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Course Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Browse Categories</h2>
            <Button variant="outline" className="hidden md:flex items-center gap-2">
              All Categories <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {courseCategories.map((category) => (
              <Link key={category.slug} href={`/courses/${category.slug}`}>
                <Card className="overflow-hidden h-full hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
                  <div className="relative h-40">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={`${category.name} category`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-4 w-full">
                        <h3 className="font-medium text-white text-lg">{category.name}</h3>
                        <p className="text-white/80 text-sm">{category.count} courses</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" className="flex items-center gap-2 mx-auto">
              All Categories <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Featured Courses</h2>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filter
              </Button>
              <select className="border rounded-md px-3 py-2 bg-white text-sm">
                <option>Most Popular</option>
                <option>Highest Rated</option>
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>

          {searchQuery && filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No courses found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or browse our categories</p>
              <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(searchQuery ? filteredCourses : featuredCourses).map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href={`/courses/${course.categorySlug}/${course.slug}`}>
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer">
                      <div className="relative">
                        <div className="relative h-48 w-full">
                          <Image
                            src={course.image || "/placeholder.svg"}
                            alt={course.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                        {course.featured && (
                          <Badge className="absolute top-3 left-3 bg-blue-600 hover:bg-blue-700">Featured</Badge>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <Badge variant="outline" className="mr-2 bg-blue-50 text-blue-700 border-blue-200">
                            {course.category}
                          </Badge>
                          <span className="mr-2">•</span>
                          <span>{course.level}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">{course.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <span className="font-medium">Instructor:</span>
                          <span className="ml-1">{course.instructor}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex items-center mr-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(course.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium">{course.rating}</span>
                            <span className="text-sm text-gray-500 ml-1">({course.reviewCount})</span>
                          </div>
                          <span className="text-sm text-gray-500">{course.duration}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Button className="bg-blue-600 hover:bg-blue-700">View All Courses</Button>
          </div>
        </div>
      </section>
    </main>
  )
}
