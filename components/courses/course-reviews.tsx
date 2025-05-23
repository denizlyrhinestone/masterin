"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar } from "@/components/ui/avatar"
import { Star, StarIcon } from "lucide-react"

interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  date: string
}

interface CourseReviewsProps {
  reviews: Review[]
  averageRating: number
  totalReviews: number
  userHasReviewed?: boolean
  onSubmitReview?: (rating: number, comment: string) => Promise<void>
}

export default function CourseReviews({
  reviews,
  averageRating,
  totalReviews,
  userHasReviewed = false,
  onSubmitReview,
}: CourseReviewsProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitReview = async () => {
    if (!onSubmitReview || rating === 0) return

    setIsSubmitting(true)
    try {
      await onSubmitReview(rating, comment)
      setRating(0)
      setComment("")
    } catch (error) {
      console.error("Failed to submit review:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Reviews</CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="font-medium">{averageRating.toFixed(1)}</span>
          <span className="text-muted-foreground">({totalReviews} reviews)</span>
        </div>
      </CardHeader>
      <CardContent>
        {!userHasReviewed && onSubmitReview && (
          <div className="mb-8 border-b pb-6">
            <h3 className="font-medium mb-3">Write a Review</h3>
            <div className="flex mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} type="button" onClick={() => setRating(i + 1)} className="p-1">
                  <Star className={`h-6 w-6 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Share your experience with this course..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mb-3"
            />
            <Button onClick={handleSubmitReview} disabled={rating === 0 || isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        )}

        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No reviews yet. Be the first to review this course!
            </p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-8 w-8">
                    {review.userAvatar ? (
                      <img src={review.userAvatar || "/placeholder.svg"} alt={review.userName} />
                    ) : (
                      <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center text-sm font-medium">
                        {review.userName.charAt(0)}
                      </div>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium">{review.userName}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
