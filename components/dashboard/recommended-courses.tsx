"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

// Sample recommended courses data
const recommendedCourses = [
  {
    id: "rec-course-1",
    title: "Machine Learning Basics",
    image: "/course-machine-learning.png",
    rating: 4.8,
    reviewCount: 245,
    price: 49.99,
  },
  {
    id: "rec-course-2",
    title: "Web Development Masterclass",
    image: "/course-web-development.png",
    rating: 4.7,
    reviewCount: 189,
    price: 59.99,
  },
  {
    id: "rec-course-3",
    title: "Digital Marketing Essentials",
    image: "/course-digital-marketing.png",
    rating: 4.6,
    reviewCount: 156,
    price: 39.99,
  },
]

export default function RecommendedCourses() {
  const [courses] = useState(recommendedCourses)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => (
        <Card key={course.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="relative w-full h-40">
              <Image src={course.image || "/placeholder.svg"} alt={course.title} fill className="object-cover" />
            </div>
            <div className="p-4">
              <h3 className="font-medium mb-2">{course.title}</h3>
              <div className="flex items-center mb-2">
                <div className="flex items-center text-yellow-500 mr-2">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="ml-1 text-sm">{course.rating}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">({course.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="font-medium">${course.price}</span>
                <Link href="/courses/details">
                  <Button size="sm">View Course</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
