"use client"

import { useState } from "react"
import { Star, ThumbsUp, MessageSquare } from "lucide-react"
import { useCourseReviews } from "@/hooks/use-course-reviews"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/pagination"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { CourseReview } from "@/types/course"

interface CourseReviewsProps {
  courseId: string
  initialLimit?: number
}

export function CourseReviews({ courseId, initialLimit = 5 }: CourseReviewsProps) {
  const [helpfulMarked, setHelpfulMarked] = useState<Record<string, boolean>>({})

  const {
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
  } = useCourseReviews(courseId, { limit: initialLimit })

  // Format date to readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (e) {
      return "Unknown date"
    }
  }

  // Calculate percentage for rating bars
  const calculatePercentage = (count: number) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "??"

    return name
      .split(" ")
      .map((part) => part[0] || "")
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Handle marking a review as helpful
  const markAsHelpful = (reviewId: string) => {
    setHelpfulMarked((prev) => ({
      ...prev,
      [reviewId]: true,
    }))
    // In a real app, you would call an API to update the helpful count
  }

  // Render star rating
  const renderStarRating = (rating: number, size: "sm" | "md" | "lg" = "sm") => {
    const sizeClass = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    }

    return (
      <div className="flex" aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass[size]} ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
            aria-hidden="true"
          />
        ))}
      </div>
    )
  }

  // Render a single review
  const renderReview = (review: CourseReview) => {
    if (!review) return null

    return (
      <div key={review.id} className="border-b pb-6 last:border-b-0" data-testid="review-item">
        <div className="flex items-center gap-3 mb-2">
          <Avatar>
            <AvatarImage
              src={review.userAvatar || "/placeholder.svg?height=40&width=40&query=user"}
              alt={review.userName || "Anonymous user"}
            />
            <AvatarFallback>{getInitials(review.userName || "Anonymous")}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{review.userName || "Anonymous user"}</div>
            <div className="text-sm text-muted-foreground">{formatDate(review.date)}</div>
          </div>
        </div>

        <div className="flex items-center mb-2">{renderStarRating(review.rating)}</div>

        <p className="text-sm mb-3 whitespace-pre-line">{review.comment || "No comment provided."}</p>

        <div className="flex items-center text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1"
            onClick={() => markAsHelpful(review.id)}
            disabled={helpfulMarked[review.id]}
            aria-label="Mark review as helpful"
          >
            <ThumbsUp className={`h-4 w-4 ${helpfulMarked[review.id] ? "fill-current" : ""}`} />
            <span>
              {helpfulMarked[review.id] ? `Helpful (${(review.helpful || 0) + 1})` : `Helpful (${review.helpful || 0})`}
            </span>
          </Button>
        </div>

        {review.response && (
          <div className="mt-4 ml-2 pl-4 border-l-2 border-primary/20 bg-muted/20 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <div className="text-sm font-medium">{review.response.from || "Instructor"}</div>
            </div>
            <div className="text-xs text-muted-foreground mb-1">{formatDate(review.response.date)}</div>
            <p className="text-sm">{review.response.comment}</p>
          </div>
        )}
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="md:col-span-2 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-6 w-40" />
                </div>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 text-center border rounded-lg bg-red-50">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => goToPage(1)}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          Student Reviews
          {totalReviews > 0 && <span className="text-sm font-normal text-muted-foreground">({totalReviews})</span>}
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter:</span>
          <div className="flex flex-wrap gap-1">
            <Button
              variant={selectedRating === null ? "secondary" : "outline"}
              size="sm"
              onClick={() => filterByRating(null)}
              className="min-w-[40px]"
            >
              All
            </Button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Button
                key={rating}
                variant={selectedRating === rating.toString() ? "secondary" : "outline"}
                size="sm"
                onClick={() => filterByRating(rating.toString())}
                className="min-w-[40px]"
              >
                {rating}★
              </Button>
            ))}
          </div>
        </div>
      </div>

      {totalReviews === 0 ? (
        <div className="text-center p-8 border rounded-md bg-muted/20">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-2 opacity-50" />
          <h4 className="text-lg font-medium mb-1">No Reviews Yet</h4>
          <p className="text-muted-foreground">Be the first to review this course!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rating summary */}
          <div className="md:col-span-1 p-4 border rounded-md bg-muted/30 h-fit">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex justify-center my-2">{renderStarRating(averageRating, "md")}</div>
              <div className="text-sm text-muted-foreground">
                Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </div>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <div className="flex items-center w-12">
                    <span>{rating}</span>
                    <Star className="h-4 w-4 ml-1 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                      style={{ width: `${calculatePercentage(ratingCounts[rating] || 0)}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-right text-sm text-muted-foreground">{ratingCounts[rating] || 0}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews list */}
          <div className="md:col-span-2">
            {reviews.length === 0 ? (
              <div className="text-center p-6 border rounded-md bg-muted/20">
                <p className="text-muted-foreground">No reviews found for the selected filter.</p>
                {selectedRating !== null && (
                  <Button variant="link" onClick={() => filterByRating(null)} className="mt-2">
                    Show all reviews
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map(renderReview)}

                {totalPages > 1 && (
                  <div className="pt-4 border-t">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
