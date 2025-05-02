import { type NextRequest, NextResponse } from "next/server"
import type { Course, PaginatedCourses } from "@/types/course"

// This is a mock database of courses
// In a real application, this would be fetched from a database
const coursesData: Course[] = [
  {
    id: "1",
    title: "Web Development Fundamentals",
    description: "Learn the core concepts of web development including HTML, CSS, and JavaScript.",
    instructor: "Sarah Johnson",
    category: "Computer Science",
    level: "Beginner",
    duration: "8 weeks",
    price: 49.99,
    rating: 4.7,
    enrolledCount: 1245,
    thumbnailUrl: "/course-web-development.png",
    tags: ["HTML", "CSS", "JavaScript", "Web Development"],
    updatedAt: "2023-09-15T00:00:00.000Z",
  },
  {
    id: "2",
    title: "AI Fundamentals",
    description: "Understand the basics of artificial intelligence and machine learning.",
    instructor: "Michael Chen",
    category: "Computer Science",
    level: "Intermediate",
    duration: "10 weeks",
    price: 69.99,
    rating: 4.8,
    enrolledCount: 987,
    thumbnailUrl: "/course-ai-fundamentals.png",
    tags: ["AI", "Machine Learning", "Python", "Data Science"],
    updatedAt: "2023-10-05T00:00:00.000Z",
  },
  {
    id: "3",
    title: "Digital Marketing Essentials",
    description: "Master the fundamentals of digital marketing strategies and tools.",
    instructor: "Emily Rodriguez",
    category: "Business",
    level: "Beginner",
    duration: "6 weeks",
    price: 39.99,
    rating: 4.5,
    enrolledCount: 1532,
    thumbnailUrl: "/course-digital-marketing.png",
    tags: ["Marketing", "SEO", "Social Media", "Analytics"],
    updatedAt: "2023-08-20T00:00:00.000Z",
  },
  {
    id: "4",
    title: "Machine Learning with Python",
    description: "Build and deploy machine learning models using Python and popular libraries.",
    instructor: "David Kim",
    category: "Data Science",
    level: "Advanced",
    duration: "12 weeks",
    price: 79.99,
    rating: 4.9,
    enrolledCount: 756,
    thumbnailUrl: "/course-machine-learning.png",
    tags: ["Python", "Machine Learning", "Data Science", "AI"],
    updatedAt: "2023-11-10T00:00:00.000Z",
  },
  {
    id: "5",
    title: "Python Programming for Beginners",
    description: "Start your programming journey with Python, one of the most popular languages.",
    instructor: "Alex Thompson",
    category: "Computer Science",
    level: "Beginner",
    duration: "8 weeks",
    price: 44.99,
    rating: 4.6,
    enrolledCount: 2134,
    thumbnailUrl: "/course-python-programming.png",
    tags: ["Python", "Programming", "Computer Science"],
    updatedAt: "2023-07-25T00:00:00.000Z",
  },
  {
    id: "6",
    title: "Data Science Bootcamp",
    description: "Comprehensive data science training covering statistics, programming, and visualization.",
    instructor: "Priya Patel",
    category: "Data Science",
    level: "Intermediate",
    duration: "14 weeks",
    price: 89.99,
    rating: 4.8,
    enrolledCount: 876,
    thumbnailUrl: "/course-data-science.png",
    tags: ["Data Science", "Statistics", "Python", "R", "Visualization"],
    updatedAt: "2023-10-30T00:00:00.000Z",
  },
  {
    id: "7",
    title: "Advanced JavaScript Patterns",
    description: "Master advanced JavaScript patterns and techniques for professional development.",
    instructor: "James Wilson",
    category: "Computer Science",
    level: "Advanced",
    duration: "10 weeks",
    price: 69.99,
    rating: 4.7,
    enrolledCount: 645,
    thumbnailUrl: "/javascript-code-abstract.png",
    tags: ["JavaScript", "Web Development", "Programming"],
    updatedAt: "2023-09-05T00:00:00.000Z",
  },
  {
    id: "8",
    title: "Business Analytics",
    description: "Learn how to analyze business data to make informed decisions.",
    instructor: "Sophia Martinez",
    category: "Business",
    level: "Intermediate",
    duration: "8 weeks",
    price: 59.99,
    rating: 4.5,
    enrolledCount: 932,
    thumbnailUrl: "/category-business.png",
    tags: ["Business", "Analytics", "Data", "Excel"],
    updatedAt: "2023-08-15T00:00:00.000Z",
  },
  {
    id: "9",
    title: "UX/UI Design Principles",
    description: "Design user-friendly interfaces with modern UX/UI principles.",
    instructor: "Olivia Lee",
    category: "Arts & Design",
    level: "All Levels",
    duration: "9 weeks",
    price: 64.99,
    rating: 4.6,
    enrolledCount: 789,
    thumbnailUrl: "/category-arts-design.png",
    tags: ["Design", "UX", "UI", "Web Design"],
    updatedAt: "2023-11-20T00:00:00.000Z",
  },
  {
    id: "10",
    title: "Blockchain Fundamentals",
    description: "Understand the core concepts of blockchain technology and cryptocurrencies.",
    instructor: "Ryan Jackson",
    category: "Computer Science",
    level: "Intermediate",
    duration: "7 weeks",
    price: 74.99,
    rating: 4.7,
    enrolledCount: 543,
    thumbnailUrl: "/interconnected-ai-nodes.png",
    tags: ["Blockchain", "Cryptocurrency", "Technology"],
    updatedAt: "2023-10-12T00:00:00.000Z",
  },
  {
    id: "11",
    title: "Content Marketing Strategy",
    description: "Develop effective content marketing strategies for digital platforms.",
    instructor: "Emma Davis",
    category: "Business",
    level: "Beginner",
    duration: "6 weeks",
    price: 49.99,
    rating: 4.4,
    enrolledCount: 1021,
    thumbnailUrl: "/data-driven-marketing.png",
    tags: ["Marketing", "Content", "Strategy", "Digital"],
    updatedAt: "2023-09-25T00:00:00.000Z",
  },
  {
    id: "12",
    title: "Mobile App Development",
    description: "Build cross-platform mobile applications using React Native.",
    instructor: "Daniel Brown",
    category: "Computer Science",
    level: "Intermediate",
    duration: "11 weeks",
    price: 79.99,
    rating: 4.8,
    enrolledCount: 678,
    thumbnailUrl: "/code-icon-abstract.png",
    tags: ["Mobile", "React Native", "JavaScript", "App Development"],
    updatedAt: "2023-11-05T00:00:00.000Z",
  },
  {
    id: "13",
    title: "Data Analysis with R",
    description: "Learn statistical analysis and data visualization using R programming.",
    instructor: "Jennifer White",
    category: "Data Science",
    level: "Intermediate",
    duration: "9 weeks",
    price: 64.99,
    rating: 4.6,
    enrolledCount: 587,
    thumbnailUrl: "/data-analysis-icon.png",
    tags: ["R", "Data Analysis", "Statistics", "Visualization"],
    updatedAt: "2023-08-30T00:00:00.000Z",
  },
  {
    id: "14",
    title: "Calculus for Data Science",
    description: "Master the calculus concepts essential for advanced data science and machine learning.",
    instructor: "Robert Chen",
    category: "Mathematics",
    level: "Advanced",
    duration: "10 weeks",
    price: 69.99,
    rating: 4.7,
    enrolledCount: 432,
    thumbnailUrl: "/math-formula-icon.png",
    tags: ["Mathematics", "Calculus", "Data Science"],
    updatedAt: "2023-10-18T00:00:00.000Z",
  },
  {
    id: "15",
    title: "Financial Management",
    description: "Learn principles of financial management for business success.",
    instructor: "Thomas Garcia",
    category: "Business",
    level: "Intermediate",
    duration: "8 weeks",
    price: 59.99,
    rating: 4.5,
    enrolledCount: 765,
    thumbnailUrl: "/upward-trend-chart.png",
    tags: ["Finance", "Business", "Management", "Economics"],
    updatedAt: "2023-09-10T00:00:00.000Z",
  },
  {
    id: "16",
    title: "Spanish for Beginners",
    description: "Start speaking Spanish with this comprehensive course for beginners.",
    instructor: "Maria Rodriguez",
    category: "Language",
    level: "Beginner",
    duration: "12 weeks",
    price: 54.99,
    rating: 4.8,
    enrolledCount: 1432,
    thumbnailUrl: "/multilingual-speech-bubbles.png",
    tags: ["Spanish", "Language", "Communication"],
    updatedAt: "2023-11-15T00:00:00.000Z",
  },
  {
    id: "17",
    title: "Introduction to Physics",
    description: "Understand the fundamental principles of physics and their applications.",
    instructor: "Alan Parker",
    category: "Science",
    level: "Beginner",
    duration: "10 weeks",
    price: 49.99,
    rating: 4.6,
    enrolledCount: 876,
    thumbnailUrl: "/science-lab-icon.png",
    tags: ["Physics", "Science", "Natural Sciences"],
    updatedAt: "2023-08-05T00:00:00.000Z",
  },
  {
    id: "18",
    title: "Digital Illustration",
    description: "Create stunning digital illustrations using professional techniques.",
    instructor: "Natalie Wong",
    category: "Arts & Design",
    level: "All Levels",
    duration: "8 weeks",
    price: 59.99,
    rating: 4.7,
    enrolledCount: 654,
    thumbnailUrl: "/colorful-art-palette.png",
    tags: ["Illustration", "Digital Art", "Design", "Creative"],
    updatedAt: "2023-10-25T00:00:00.000Z",
  },
  {
    id: "19",
    title: "Leadership Skills",
    description: "Develop essential leadership skills for professional growth.",
    instructor: "Christopher Lewis",
    category: "Personal Development",
    level: "All Levels",
    duration: "6 weeks",
    price: 44.99,
    rating: 4.5,
    enrolledCount: 1098,
    thumbnailUrl: "/confident-leader.png",
    tags: ["Leadership", "Management", "Professional Development"],
    updatedAt: "2023-09-20T00:00:00.000Z",
  },
  {
    id: "20",
    title: "Cloud Computing Fundamentals",
    description: "Learn the basics of cloud computing and major cloud platforms.",
    instructor: "Kevin Taylor",
    category: "Computer Science",
    level: "Intermediate",
    duration: "9 weeks",
    price: 69.99,
    rating: 4.6,
    enrolledCount: 765,
    thumbnailUrl: "/interconnected-learning.png",
    tags: ["Cloud Computing", "AWS", "Azure", "GCP", "Technology"],
    updatedAt: "2023-11-01T00:00:00.000Z",
  },
]

// Generate more mock courses for testing pagination
for (let i = 21; i <= 100; i++) {
  const categories = [
    "Computer Science",
    "Data Science",
    "Business",
    "Mathematics",
    "Language",
    "Science",
    "Arts & Design",
    "Personal Development",
  ]
  const levels = ["Beginner", "Intermediate", "Advanced", "All Levels"] as const

  coursesData.push({
    id: i.toString(),
    title: `Course ${i}: Extended Learning Path`,
    description: `This is an automatically generated course for testing pagination. Course number ${i}.`,
    instructor: `Instructor ${i}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    level: levels[Math.floor(Math.random() * levels.length)],
    duration: `${Math.floor(Math.random() * 10) + 4} weeks`,
    price: Math.floor(Math.random() * 100) + 29.99,
    rating: Math.floor(Math.random() * 10) / 10 + 4,
    enrolledCount: Math.floor(Math.random() * 2000) + 100,
    thumbnailUrl: `/placeholder.svg?height=400&width=600&query=course ${i}`,
    tags: ["Learning", "Education", `Tag ${i}`],
    updatedAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
  })
}

export async function GET(request: NextRequest) {
  // Get search parameters from the request URL
  const searchParams = request.nextUrl.searchParams
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "12")
  const search = searchParams.get("search") || ""
  const category = searchParams.get("category") || ""
  const level = searchParams.get("level") || ""
  const sort = searchParams.get("sort") || "newest"

  // Simulate server processing delay (remove in production)
  // await new Promise(resolve => setTimeout(resolve, 500));

  // Filter courses based on search parameters
  let filteredCourses = [...coursesData]

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase()
    filteredCourses = filteredCourses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
    )
  }

  // Apply category filter
  if (category) {
    filteredCourses = filteredCourses.filter((course) => course.category === category)
  }

  // Apply level filter
  if (level) {
    filteredCourses = filteredCourses.filter((course) => course.level === level)
  }

  // Apply sorting
  switch (sort) {
    case "newest":
      filteredCourses.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      break
    case "popular":
      filteredCourses.sort((a, b) => b.enrolledCount - a.enrolledCount)
      break
    case "price-low":
      filteredCourses.sort((a, b) => a.price - b.price)
      break
    case "price-high":
      filteredCourses.sort((a, b) => b.price - a.price)
      break
    case "rating":
      filteredCourses.sort((a, b) => b.rating - a.rating)
      break
    default:
      filteredCourses.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  // Calculate pagination values
  const totalCourses = filteredCourses.length
  const totalPages = Math.ceil(totalCourses / limit)
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit

  // Get the courses for the current page
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex)

  // Return the paginated results
  const response: PaginatedCourses = {
    courses: paginatedCourses,
    totalCourses,
    totalPages,
    currentPage: page,
  }

  return NextResponse.json(response)
}
