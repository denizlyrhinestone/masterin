import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Lesson: Introduction to AI - Masterin",
  description: "Introduction to artificial intelligence",
}

export default function LessonPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/courses/details">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
            </Link>
            <div className="text-sm text-gray-500">Lesson 1 of 12</div>
          </div>

          {/* Lesson Content */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Lesson 1: Introduction to AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Video Player Placeholder</p>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <h2>Welcome to Introduction to AI!</h2>
                <p>
                  In this introductory lesson, we'll cover the basics of artificial intelligence and set up the
                  foundation for your learning journey. This course is designed to take you from beginner to advanced
                  level through practical examples and exercises.
                </p>

                <h3>What You'll Learn</h3>
                <ul>
                  <li>The history and evolution of AI</li>
                  <li>Key concepts and terminology</li>
                  <li>Different types of AI systems</li>
                  <li>Real-world applications of AI</li>
                </ul>

                <h3>Prerequisites</h3>
                <p>
                  No prior experience with AI is required for this course. Basic programming knowledge is helpful but
                  not necessary.
                </p>

                <h3>Course Materials</h3>
                <p>
                  All course materials are provided within the platform. You'll have access to video lessons,
                  downloadable resources, and interactive exercises.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" disabled>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous Lesson
            </Button>
            <Button disabled>
              Next Lesson
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
