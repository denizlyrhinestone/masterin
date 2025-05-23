import { Suspense } from "react"
import type { Metadata } from "next"
import { getSubjects, getGradeLevels } from "@/lib/course-service"
import CourseFilters from "@/components/courses/course-filters"
import CourseGrid from "@/components/courses/course-grid"
import CourseSearch from "@/components/courses/course-search"
import CoursesSkeleton from "@/components/courses/courses-skeleton"

export const metadata: Metadata = {
  title: "Courses",
  description: "Browse our comprehensive collection of K-12 courses across various subjects and grade levels.",
}

interface CoursesPageProps {
  searchParams: {
    query?: string
    subject?: string
    gradeLevel?: string
    sort?: string
    page?: string
  }
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const subjects = await getSubjects()
  const gradeLevels = await getGradeLevels()

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container px-4 py-8 md:py-12">
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Courses</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Browse our comprehensive collection of K-12 courses across various subjects and grade levels.
            </p>
          </div>

          <CourseSearch defaultValue={searchParams.query || ""} />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-1">
              <CourseFilters
                subjects={subjects}
                gradeLevels={gradeLevels}
                selectedSubject={searchParams.subject}
                selectedGradeLevel={searchParams.gradeLevel}
                selectedSort={searchParams.sort as any}
              />
            </div>

            <div className="md:col-span-3">
              <Suspense fallback={<CoursesSkeleton />}>
                <CourseGrid searchParams={searchParams} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
