"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Course } from "@/types/course"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  // Use thumbnailUrl consistently, falling back to thumbnail if needed
  const imageUrl = course.thumbnailUrl || course.thumbnail || "/placeholder.svg"

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <div className={`transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}>
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            onLoad={() => setImageLoaded(true)}
            priority={false}
            crossOrigin="anonymous" // Add crossOrigin for security
          />
        </div>
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-gray-800 animate-spin"></div>
          </div>
        )}
        <Badge className="absolute top-2 right-2 bg-primary">{course.level}</Badge>
      </div>
      <CardContent className="flex-grow p-4">
        <div className="mb-2 flex items-center text-sm text-muted-foreground">
          <span>{course.category}</span>
          <span className="mx-2">•</span>
          <span>{course.duration}</span>
        </div>
        <h3 className="text-xl font-semibold mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-3">{course.description}</p>
        <div className="flex items-center text-sm">
          <div className="flex items-center mr-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="font-medium">{course.rating.toFixed(1)}</span>
          </div>
          <span className="text-muted-foreground">({course.enrolledCount.toLocaleString()} students)</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="text-lg font-bold">${course.price.toFixed(2)}</div>
        <Link
          href={`/courses/${course.id}`}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          View Course
        </Link>
      </CardFooter>
    </Card>
  )
}
