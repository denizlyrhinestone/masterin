"use client"

import { useEffect, useState } from "react"
import { CourseCard } from "@/components/courses/course-card"
import { Pagination } from "@/components/ui/pagination"
import { getCourses } from "@/lib/course-service"
import type { Course } from "@/types"

interface CourseGridProps {
  searchParams: {
    query?: string
    subject?: string
    gradeLevel?: string
    sort?: string
    page?: string
  }
}

export default function CourseGrid({ searchParams }: CourseGridProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const currentPage = searchParams.page ? Number.parseInt(searchParams.page) : 1

  useEffect(() => {
    async function loadCourses() {
      setLoading(true)
      try {
        const result = await getCourses({
          query: searchParams.query,
          subject: searchParams.subject,
          gradeLevel: searchParams.gradeLevel,
          sort: searchParams.sort as any,
          page: currentPage,
          limit: 9,
        })

        setCourses(result.courses)
        setTotalPages(result.totalPages)
      } catch (error) {
        console.error("Failed to load courses:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [searchParams, currentPage])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[320px] rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-xl font-semibold mb-2">No courses found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your search or filter criteria</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl={`/courses?${new URLSearchParams({
            ...(searchParams.query && { query: searchParams.query }),
            ...(searchParams.subject && { subject: searchParams.subject }),
            ...(searchParams.gradeLevel && { gradeLevel: searchParams.gradeLevel }),
            ...(searchParams.sort && { sort: searchParams.sort }),
          }).toString()}`}
        />
      )}
    </div>
  )
}
