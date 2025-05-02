"use client"

import { useState, useEffect, useCallback } from "react"
import type { Course, PaginatedCourses, CourseSearchParams } from "@/types/course"

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCourses, setTotalCourses] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  // Default search params
  const [searchParams, setSearchParams] = useState<CourseSearchParams>({
    page: 1,
    limit: 12,
    search: "",
    category: "",
    level: "",
    sort: "newest",
  })

  const fetchCourses = useCallback(async (params: CourseSearchParams) => {
    setLoading(true)
    setError(null)

    try {
      // Build query string from params
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append("page", params.page.toString())
      if (params.limit) queryParams.append("limit", params.limit.toString())
      if (params.search) queryParams.append("search", params.search)
      if (params.category) queryParams.append("category", params.category)
      if (params.level) queryParams.append("level", params.level)
      if (params.sort) queryParams.append("sort", params.sort)

      const response = await fetch(`/api/courses?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error(`Error fetching courses: ${response.status}`)
      }

      const data: PaginatedCourses = await response.json()

      setCourses(data.courses)
      setTotalCourses(data.totalCourses)
      setTotalPages(data.totalPages)
      setCurrentPage(data.currentPage)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Update search params and fetch courses
  const updateSearchParams = useCallback(
    (newParams: Partial<CourseSearchParams>) => {
      setSearchParams((prev) => {
        // If changing filters, reset to page 1
        const resetPage =
          (newParams.search !== undefined && newParams.search !== prev.search) ||
          (newParams.category !== undefined && newParams.category !== prev.category) ||
          (newParams.level !== undefined && newParams.level !== prev.level) ||
          (newParams.sort !== undefined && newParams.sort !== prev.sort)

        const updatedParams = {
          ...prev,
          ...newParams,
          page: resetPage ? 1 : newParams.page || prev.page,
        }

        // Fetch courses with updated params
        fetchCourses(updatedParams)

        return updatedParams
      })
    },
    [fetchCourses],
  )

  // Initial fetch
  useEffect(() => {
    fetchCourses(searchParams)
  }, [])

  return {
    courses,
    loading,
    error,
    totalCourses,
    totalPages,
    currentPage,
    searchParams,
    updateSearchParams,
  }
}
