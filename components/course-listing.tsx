"use client"

import { useState, useEffect } from "react"
import { useCourses } from "@/hooks/use-courses"
import { CourseCard } from "@/components/course-card"
import { CourseFilters } from "@/components/course-filters"
import { Pagination } from "@/components/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { useInView } from "react-intersection-observer"

export function CourseListing() {
  const { courses, loading, error, totalCourses, totalPages, currentPage, searchParams, updateSearchParams } =
    useCourses()

  const [isClient, setIsClient] = useState(false)

  // Set isClient to true on mount
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle page change
  const handlePageChange = (page: number) => {
    updateSearchParams({ page })
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Setup intersection observer for the filter section
  const { ref: filterRef, inView: filterInView } = useInView({
    threshold: 0,
    initialInView: true,
  })

  // Setup intersection observer for the course grid
  const { ref: gridRef, inView: gridInView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array.from({ length: 12 }).map((_, index) => (
      <div key={index} className="h-full">
        <Skeleton className="h-48 w-full rounded-t-md" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <div className="flex justify-between pt-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      </div>
    ))
  }

  // Render error message
  if (error && isClient) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Courses</h2>
        <p className="text-muted-foreground">{error}</p>
        <button
          onClick={() => updateSearchParams(searchParams)}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <div ref={filterRef} className="md:w-64 lg:w-72 shrink-0">
          <div
            className={`md:sticky md:top-4 transition-all duration-200 ${filterInView ? "translate-y-0" : "md:-translate-y-4"}`}
          >
            <CourseFilters
              searchParams={searchParams}
              onUpdateSearchParams={updateSearchParams}
              totalCourses={totalCourses}
            />
          </div>
        </div>

        {/* Course grid */}
        <div className="flex-1">
          <div
            ref={gridRef}
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-500 ${gridInView ? "opacity-100" : "opacity-0"}`}
          >
            {loading && isClient
              ? renderSkeletons()
              : courses.map((course) => <CourseCard key={course.id} course={course} />)}
          </div>

          {/* No results message */}
          {!loading && courses.length === 0 && isClient && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No Courses Found</h2>
              <p className="text-muted-foreground mb-4">Try adjusting your search or filter criteria</p>
              <button
                onClick={() =>
                  updateSearchParams({
                    search: "",
                    category: "",
                    level: "",
                    sort: "newest",
                    page: 1,
                  })
                }
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && isClient && (
            <div className="mt-8 flex justify-center">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
