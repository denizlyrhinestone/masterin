import { Suspense } from "react"
import { CourseListing } from "@/components/course-listing"
import CoursesLoading from "./loading"

export const metadata = {
  title: "Courses | Masterin",
  description: "Browse our extensive catalog of courses to enhance your skills and knowledge.",
}

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="py-8 md:py-12 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Explore Our Courses</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover a wide range of courses designed to help you master new skills, advance your career, and achieve
            your learning goals.
          </p>
        </div>
      </div>

      <Suspense fallback={<CoursesLoading />}>
        <CourseListing />
      </Suspense>
    </div>
  )
}
