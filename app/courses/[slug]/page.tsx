"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, Filter, Star, ChevronLeft } from "lucide-react"

// Course categories data
const courseCategories = [
  {
    name: "Technology",
    slug: "technology",
    image: "/placeholder.svg?height=160&width=320&text=Technology",
    icon: <BookOpen className="h-5 w-5 text-blue-600" />,
    description: "Explore courses in web development, mobile apps, programming languages, cloud computing, and more.",
  },
  {
    name: "Business",
    slug: "business",
    image: "/placeholder.svg?height=160&width=320&text=Business",
    icon: <BookOpen className="h-5 w-5 text-purple-600" />,
    description: "Discover courses in marketing, entrepreneurship, finance, management, and business strategy.",
  },
  {
    name: "Art & Design",
    slug: "art-design",
    image: "/placeholder.svg?height=160&width=320&text=Art+%26+Design",
    icon: <BookOpen className="h-5 w-5 text-pink-600" />,
    description: "Learn graphic design, illustration, UI/UX design, animation, and other creative skills.",
  },
  {
    name: "Data Science",
    slug: "data-science",
    image: "/placeholder.svg?height=160&width=320&text=Data+Science",
    icon: <BookOpen className="h-5 w-5 text-green-600" />,
    description: "Master data analysis, machine learning, statistics, visualization, and big data technologies.",
  },
  {
    name: "Languages",
    slug: "languages",
    image: "/placeholder.svg?height=160&width=320&text=Languages",
    icon: <BookOpen className="h-5 w-5 text-orange-600" />,
    description: "Learn English, Spanish, Mandarin, French, German, and other languages from expert instructors.",
  },
  {
    name: "Academics",
    slug: "academics",
    image: "/placeholder.svg?height=160&width=320&text=Academics",
    icon: <BookOpen className="h-5 w-5 text-indigo-600" />,
    description: "Study mathematics, science, history, literature, and other academic subjects.",
  },
  {
    name: "Photography",
    slug: "photography",
    image: "/placeholder.svg?height=160&width=320&text=Photography",
    icon: <BookOpen className="h-5 w-5 text-cyan-600" />,
    description: "Develop skills in digital photography, editing, composition, lighting, and specialized techniques.",
  },
  {
    name: "Music",
    slug: "music",
    image: "/placeholder.svg?height=160&width=320&text=Music",
    icon: <BookOpen className="h-5 w-5 text-red-600" />,
    description: "Learn to play instruments, music theory, production, composition, and vocal techniques.",
  },
]

// All courses data
const allCourses = [
  // Technology courses
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
    id: 7,
    title: "Mobile App Development with React Native",
    slug: "mobile-app-react-native",
    category: "Technology",
    categorySlug: "technology",
    image: "/placeholder.svg?height=200&width=400&text=React+Native",
    instructor: "Alex Thompson",
    rating: 4.7,
    reviewCount: 1832,
    level: "Intermediate",
    duration: "10 weeks",
    description:
      "Build cross-platform mobile apps for iOS and Android using React Native. Create real-world applications.",
    featured: false,
  },
  {
    id: 8,
    title: "DevOps Engineering & Cloud Computing",
    slug: "devops-cloud-computing",
    category: "Technology",
    categorySlug: "technology",
    image: "/placeholder.svg?height=200&width=400&text=DevOps",
    instructor: "Marcus Lee",
    rating: 4.9,
    reviewCount: 1245,
    level: "Advanced",
    duration: "8 weeks",
    description:
      "Master CI/CD pipelines, containerization, cloud services, and infrastructure as code for modern deployment.",
    featured: false,
  },

  // Business courses
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
  {
    id: 9,
    title: "Entrepreneurship: Start Your Business",
    slug: "entrepreneurship-start-business",
    category: "Business",
    categorySlug: "business",
    image: "/placeholder.svg?height=200&width=400&text=Entrepreneurship",
    instructor: "Sophia Garcia",
    rating: 4.8,
    reviewCount: 1456,
    level: "Beginner",
    duration: "8 weeks",
    description:
      "Learn how to validate ideas, create business plans, secure funding, and launch your own successful business.",
    featured: false,
  },

  // Data Science courses
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
    id: 10,
    title: "Machine Learning A-Z",
    slug: "machine-learning-a-z",
    category: "Data Science",
    categorySlug: "data-science",
    image: "/placeholder.svg?height=200&width=400&text=Machine+Learning",
    instructor: "David Kim",
    rating: 4.9,
    reviewCount: 2134,
    level: "Intermediate to Advanced",
    duration: "12 weeks",
    description:
      "Comprehensive course covering supervised and unsupervised learning, neural networks, and practical applications.",
    featured: false,
  },

  // Art & Design courses
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
    id: 11,
    title: "Graphic Design Masterclass",
    slug: "graphic-design-masterclass",
    category: "Art & Design",
    categorySlug: "art-design",
    image: "/placeholder.svg?height=200&width=400&text=Graphic+Design",
    instructor: "Lisa Wong",
    rating: 4.8,
    reviewCount: 1653,
    level: "All Levels",
    duration: "8 weeks",
    description:
      "Master Adobe Creative Suite and design principles to create stunning graphics, logos, and marketing materials.",
    featured: false,
  },
]

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState<any>(null)
  const [courses, setCourses] = useState<any[]>([])

  useEffect(() => {
    // Find the category based on the slug
    const foundCategory = courseCategories.find((cat) => cat.slug === params.slug)
    setCategory(foundCategory || null)

    // Filter courses by category
    const filteredCourses = allCourses.filter((course) => course.categorySlug === params.slug)
    setCourses(filteredCourses)
  }, [params.slug])

  // Filter courses based on search query
  const searchFilteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Category not found</h1>
        <p className="mb-8">The category you're looking for doesn't exist or has been moved.</p>
        <Button asChild>
          <Link href="/courses">Back to Courses</Link>
        </Button>
      </div>
    )
  }

  return (
    <main className="flex flex-col min-h-screen" id="main-content">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link href="/courses" className="inline-flex items-center text-blue-100 hover:text-white mb-6">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to all categories
            </Link>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">{category.name} Courses</h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">{category.description}</p>
            <div className="relative max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder={`Search ${category.name} courses...`}
                className="pl-10 py-6 text-gray-900 rounded-lg w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">
              {searchQuery ? "Search Results" : `All ${category.name} Courses`}
            </h2>
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

          {searchQuery && searchFilteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No courses found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or browse other categories</p>
              <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
            </div>
          ) : searchFilteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No courses available</h3>
              <p className="text-gray-600 mb-6">We're working on adding courses to this category</p>
              <Button asChild>
                <Link href="/courses">Browse Other Categories</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(searchQuery ? searchFilteredCourses : courses).map((course) => (
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
            <Button className="bg-blue-600 hover:bg-blue-700">View All {category.name} Courses</Button>
          </div>
        </div>
      </section>
    </main>
  )
}
