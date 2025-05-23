"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

// Sample enrolled courses data
const enrolledCourses = [
  {
    id: "course-1",
    title: "Introduction to AI",
    image: "/course-ai-fundamentals.png",
    progress: 65,
    lastAccessed: "2023-09-15T14:30:00Z",
  },
  {
    id: "course-2",
    title: "Data Science Fundamentals",
    image: "/course-data-science.png",
    progress: 30,
    lastAccessed: "2023-09-10T09:15:00Z",
  },
]

export default function EnrolledCourses() {
  const [courses] = useState(enrolledCourses)

  if (courses.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">No Enrolled Courses</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't enrolled in any courses yet.</p>
            <Link href="/courses">
              <Button>Browse Courses</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <Card key={course.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              <div className="relative w-full sm:w-48 h-32">
                <Image src={course.image || "/placeholder.svg"} alt={course.title} fill className="object-cover" />
              </div>
              <div className="p-4 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <h3 className="font-medium">{course.title}</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(course.lastAccessed).toLocaleDateString()}
                  </span>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
                <div className="flex justify-end">
                  <Link href="/courses/details">
                    <Button variant="outline" size="sm">
                      Continue
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
