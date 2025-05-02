import { type NextRequest, NextResponse } from "next/server"
import type { CourseReview, PaginatedReviews } from "@/types/course"

// Generate mock reviews for a course
const generateMockReviews = (courseId: string, count: number): CourseReview[] => {
  const reviews: CourseReview[] = []
  const names = [
    "Alex Thompson",
    "Jamie Rivera",
    "Jordan Smith",
    "Taylor Johnson",
    "Casey Williams",
    "Morgan Brown",
    "Riley Davis",
    "Quinn Miller",
    "Avery Wilson",
    "Blake Martinez",
    "Sam Lee",
    "Chris Park",
    "Jesse Kim",
    "Robin Chen",
    "Dakota Singh",
    "Skyler Patel",
  ]

  const comments = [
    "This course exceeded my expectations. The content is well-structured and easy to follow.",
    "I've learned so much in such a short time. Highly recommended for anyone looking to improve their skills.",
    "The instructor explains complex concepts in a way that's easy to understand. Great course!",
    "Very practical course with real-world examples. I'm already applying what I've learned.",
    "Excellent content and presentation. The exercises really helped reinforce the concepts.",
    "This course has been instrumental in advancing my career. Thank you!",
    "Well-paced and comprehensive. I appreciate the attention to detail.",
    "The instructor's enthusiasm makes learning enjoyable. Great experience overall.",
    "I've taken many courses on this subject, and this is by far the best one.",
    "Clear explanations and practical examples. Exactly what I was looking for.",
    "The course content is good, but I wish there were more practical exercises.",
    "Great value for the price. I learned more than I expected.",
    "The instructor is very responsive to questions in the discussion forum.",
    "This course helped me land my dream job. Can't recommend it enough!",
    "Some sections could be more in-depth, but overall a solid course.",
    "The real-world projects were incredibly valuable for building my portfolio.",
  ]

  for (let i = 1; i <= count; i++) {
    const rating = Math.floor(Math.random() * 3) + 3 // Ratings between 3-5
    const nameIndex = Math.floor(Math.random() * names.length)
    const commentIndex = Math.floor(Math.random() * comments.length)

    const daysAgo = Math.floor(Math.random() * 180) // Random date within last 6 months
    const reviewDate = new Date(Date.now() - daysAgo * 86400000)

    const review: CourseReview = {
      id: `${courseId}-review-${i}`,
      userId: `user-${nameIndex}-${i}`,
      userName: names[nameIndex],
      userAvatar: `/placeholder.svg?height=100&width=100&query=avatar ${nameIndex}`,
      rating,
      comment: comments[commentIndex],
      date: reviewDate.toISOString(),
      helpful: Math.floor(Math.random() * 20),
    }

    // Add instructor response to some reviews (about 15%)
    if (Math.random() < 0.15) {
      const responseDate = new Date(reviewDate.getTime() + Math.floor(Math.random() * 7 * 86400000)) // Response within a week
      review.response = {
        from: "Course Instructor",
        comment: "Thank you for your feedback! I'm glad you found the course helpful and I appreciate your insights.",
        date: responseDate.toISOString(),
      }
    }

    reviews.push(review)
  }

  // Sort by date (newest first)
  return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const courseId = params.id
  const searchParams = request.nextUrl.searchParams
  const page = Number(searchParams.get("page") || "1")
  const limit = Number(searchParams.get("limit") || "5")
  const rating = searchParams.get("rating") // Filter by rating if provided

  // Generate 50-100 reviews for the course
  const reviewCount = 50 + (Number(courseId) % 5) * 10
  const allReviews = generateMockReviews(courseId, reviewCount)

  // Filter by rating if specified
  let filteredReviews = allReviews
  if (rating && ["1", "2", "3", "4", "5"].includes(rating)) {
    const ratingNum = Number(rating)
    filteredReviews = allReviews.filter((review) => review.rating === ratingNum)
  }

  // Calculate rating distribution
  const ratingCounts = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  }

  allReviews.forEach((review) => {
    ratingCounts[review.rating]++
  })

  // Calculate average rating
  const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0)
  const averageRating = totalRating / allReviews.length

  // Paginate the reviews
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedReviews = filteredReviews.slice(startIndex, endIndex)

  const response: PaginatedReviews = {
    reviews: paginatedReviews,
    totalReviews: filteredReviews.length,
    totalPages: Math.ceil(filteredReviews.length / limit),
    currentPage: page,
    averageRating,
    ratingCounts,
  }

  return NextResponse.json(response)
}
