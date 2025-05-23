import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Courses - Masterin",
  description: "Explore our comprehensive course catalog",
}

export default function CoursesPage() {
  const courses = [
    {
      id: 1,
      title: "Introduction to AI",
      description: "Learn the fundamentals of artificial intelligence and machine learning",
      image: "/course-placeholder.png",
      instructor: "John Doe",
      duration: "4 weeks",
      level: "Beginner",
      price: 49.99,
      rating: 4.5,
      reviewCount: 120,
      enrolledCount: 1500,
    },
    {
      id: 2,
      title: "Advanced Data Science",
      description: "Master advanced data science techniques and applications",
      image: "/course-placeholder.png",
      instructor: "Jane Smith",
      duration: "6 weeks",
      level: "Advanced",
      price: 79.99,
      rating: 4.7,
      reviewCount: 85,
      enrolledCount: 950,
    },
    {
      id: 3,
      title: "Web Development Fundamentals",
      description: "Build responsive websites with modern web technologies",
      image: "/course-placeholder.png",
      instructor: "Mike Johnson",
      duration: "8 weeks",
      level: "Intermediate",
      price: 59.99,
      rating: 4.3,
      reviewCount: 210,
      enrolledCount: 2300,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Courses</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover our comprehensive course catalog designed to help you master new skills and advance your career.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative">
                <Image src={course.image || "/placeholder.svg"} alt={course.title} fill className="object-cover" />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{course.level}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{course.rating}</span>
                    <span className="text-sm text-gray-500">({course.reviewCount})</span>
                  </div>
                </div>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.enrolledCount.toLocaleString()} students
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold">${course.price}</span>
                </div>
                <Link href="/courses/details">
                  <Button>View Course</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
