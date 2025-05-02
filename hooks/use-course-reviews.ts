"use client"

import { useState, useEffect, useCallback } from "react"
import type { CourseReview, PaginatedReviews } from "@/types/course"

interface UseReviewsOptions {
  limit?: number
  initialRating?: string
}

export function useCourseReviews(courseId: string, options: UseReviewsOptions = {}) {
  const { limit = 5, initialRating } = options

  const [reviews, setReviews] = useState<CourseReview[]>([])
  const [totalReviews, setTotalReviews] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [averageRating, setAverageRating] = useState(0)
  const [ratingCounts, setRatingCounts] = useState<Record<number, number>>({})
  const [selectedRating, setSelectedRating] = useState<string | null>(initialRating || null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = useCallback(
    async (page: number, rating: string | null) => {
      if (!courseId) {
        setError("Course ID is required")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        let url = `/api/courses/${courseId}/reviews?page=${page}&limit=${limit}`
        if (rating) {
          url += `&rating=${rating}`
        }

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Failed to fetch reviews: ${response.status}`)
        }

        const data: PaginatedReviews = await response.json()

        // Validate data structure
        if (!data || !Array.isArray(data.reviews)) {
          throw new Error("Invalid response format")
        }

        setReviews(data.reviews)
        setTotalReviews(data.totalReviews || 0)
        setTotalPages(data.totalPages || 1)
        setCurrentPage(data.currentPage || 1)
        setAverageRating(data.averageRating || 0)
        setRatingCounts(data.ratingCounts || {})
      } catch (err) {
        console.error("Error fetching course reviews:", err)
        setError("Failed to load reviews. Please try again later.")
        // Set default values on error
        setReviews([])
        setTotalReviews(0)
        setTotalPages(0)
        setCurrentPage(1)
        setAverageRating(0)
        setRatingCounts({})
      } finally {
        setIsLoading(false)
      }
    },
    [courseId, limit],
  )

  // Initial fetch
  useEffect(() => {
    fetchReviews(1, selectedRating)
  }, [fetchReviews, selectedRating])

  // Change page
  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page)
        fetchReviews(page, selectedRating)
      }
    },
    [fetchReviews, selectedRating, totalPages],
  )

  // Filter by rating
  const filterByRating = useCallback(
    (rating: string | null) => {
      setSelectedRating(rating)
      setCurrentPage(1)
      fetchReviews(1, rating)
    },
    [fetchReviews],
  )

  // Refresh reviews (useful after submitting a new review)
  const refreshReviews = useCallback(() => {
    fetchReviews(currentPage, selectedRating)
  }, [fetchReviews, currentPage, selectedRating])

  return {
    reviews,
    totalReviews,
    totalPages,
    currentPage,
    averageRating,
    ratingCounts,
    selectedRating,
    isLoading,
    error,
    goToPage,
    filterByRating,
    refreshReviews,
  }
}
