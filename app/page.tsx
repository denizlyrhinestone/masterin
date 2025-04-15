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

        <Suspense fallback={<LoadingSpinner />}>
          <ErrorBoundary
            fallback={
              <div className="py-8">
                <h2 className="text-3xl font-bold mb-6">Popular Courses</h2>
                <p className="text-gray-500">Unable to load popular courses at this time. Please try again later.</p>
              </div>
            }
          >
            <PopularCourses />
          </ErrorBoundary>
        </Suspense>

        <AiFeaturePreview />
      </div>
    </main>
  )
}
