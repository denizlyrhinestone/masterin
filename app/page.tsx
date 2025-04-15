import { Suspense } from "react"
import { CategoryGrid } from "@/components/category-grid"
import { Hero } from "@/components/hero"
import { FeaturedClasses } from "@/components/featured-classes"
import { AiFeaturePreview } from "@/components/ai-feature-preview"
import { LoadingSpinner } from "@/components/loading-spinner"
import { PopularCourses } from "@/components/popular-courses"
import { ErrorBoundary } from "@/components/error-boundary"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <div className="container mx-auto px-4 py-12 space-y-16">
        <Suspense fallback={<LoadingSpinner />}>
          <CategoryGrid />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <FeaturedClasses />
        </Suspense>

        <ErrorBoundary
          fallback={
            <div className="py-8">
              <h2 className="text-3xl font-bold mb-6">Popular Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.values(FallbackCourses).map((course) => (
                  <div key={course.id} className="border rounded-lg overflow-hidden h-full">
                    <div className="relative h-40 w-full bg-gray-200"></div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{course.title}</h3>
                      <p className="text-sm text-gray-500">Instructor: {course.instructor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <Suspense fallback={<LoadingSpinner />}>
            <PopularCourses />
          </Suspense>
        </ErrorBoundary>

        <AiFeaturePreview />
      </div>
    </main>
  )
}

// Fallback courses for the error boundary
const FallbackCourses = {
  "web-development": {
    id: "web-development",
    title: "Full-Stack Web Development",
    instructor: "Sarah Johnson",
  },
  "machine-learning": {
    id: "machine-learning",
    title: "Machine Learning Fundamentals",
    instructor: "Dr. Michael Chen",
  },
  "ui-design": {
    id: "ui-design",
    title: "UI/UX Design Principles",
    instructor: "Emma Rodriguez",
  },
  "python-programming": {
    id: "python-programming",
    title: "Python for Data Analysis",
    instructor: "James Wilson",
  },
}
