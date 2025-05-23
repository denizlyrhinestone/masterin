import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Lesson 2: Getting Started - Sample Course",
  description: "Getting started lesson for the sample course",
}

export default function Lesson2Page() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/courses/sample-course">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
            </Link>
            <div className="text-sm text-gray-500">Lesson 2 of 12</div>
          </div>

          {/* Lesson Content */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-purple-600" />
                Lesson 2: Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Video Player Placeholder</p>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <h2>Getting Started with the Fundamentals</h2>
                <p>
                  Now that you've completed the introduction, let's dive into the core concepts that will form the
                  foundation of your learning journey.
                </p>

                <h3>Key Concepts</h3>
                <ul>
                  <li>Understanding the basic principles</li>
                  <li>Setting up your workspace</li>
                  <li>First practical exercise</li>
                  <li>Common mistakes to avoid</li>
                </ul>

                <h3>Practical Exercise</h3>
                <p>
                  In this lesson, you'll complete your first hands-on exercise. This will help reinforce the concepts
                  we've covered and give you practical experience.
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Exercise 1</h4>
                  <p className="text-blue-800 dark:text-blue-200">
                    Complete the setup process and create your first project following the step-by-step guide.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Link href="/courses/sample-course/lesson-1">
              <Button variant="outline">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Lesson
              </Button>
            </Link>
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
