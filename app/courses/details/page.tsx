import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, Star, BookOpen } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Course Details - Masterin",
  description: "Learn with our comprehensive course",
}

export default function CourseDetailsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Image
                src="/course-placeholder.png"
                alt="Course"
                width={800}
                height={400}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-4">Introduction to AI</h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  Learn the fundamentals of artificial intelligence and machine learning through practical examples and
                  hands-on projects.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Beginner</Badge>
                <Badge variant="secondary">4 Weeks</Badge>
                <Badge variant="secondary">Self-Paced</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <span className="text-sm">4 weeks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span className="text-sm">1,500 students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-600" />
                  <span className="text-sm">4.5 rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <span className="text-sm">12 lessons</span>
                </div>
              </div>

              {/* Course Lessons */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Content</CardTitle>
                  <CardDescription>12 lessons • 6 hours total</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Lesson 1: Introduction to AI</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        Get started with the basics of artificial intelligence.
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">15 minutes</span>
                        <Link href="/courses/details/lesson">
                          <Button size="sm">Start Lesson</Button>
                        </Link>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Lesson 2: Machine Learning Basics</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        Learn the fundamental concepts of machine learning.
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">25 minutes</span>
                        <Button size="sm" variant="outline">
                          View Lesson
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 opacity-60">
                      <h3 className="font-semibold mb-2">Lesson 3: Neural Networks</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        Dive deeper into neural networks and deep learning.
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">30 minutes</span>
                        <Button size="sm" variant="outline" disabled>
                          Locked
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-2xl">$49.99</CardTitle>
                <CardDescription>One-time payment • Lifetime access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" size="lg">
                  Enroll Now
                </Button>
                <Button variant="outline" className="w-full">
                  Try Free Preview
                </Button>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Instructor:</span>
                    <span className="font-medium">John Doe</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Language:</span>
                    <span className="font-medium">English</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Certificate:</span>
                    <span className="font-medium">Yes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
