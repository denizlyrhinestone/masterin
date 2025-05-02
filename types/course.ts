export interface Course {
  id: string
  title: string
  description: string
  gradeLevel: string
  aiFeatures: string[]

  // Standardize on thumbnailUrl as the primary property
  thumbnailUrl: string
  // Keep thumbnail for backward compatibility, but mark as deprecated
  /** @deprecated Use thumbnailUrl instead */
  thumbnail?: string

  category: string
  subcategory: string
  popular?: boolean
  new?: boolean
  tags?: string[]
  instructor: string
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels"
  duration: string
  price: number
  rating: number
  enrolledCount: number
  updatedAt: string

  // Additional fields for detailed view
  longDescription?: string
  objectives?: string[]
  requirements?: string[]
  curriculum?: CourseCurriculum
  reviews?: CourseReview[]
  instructorDetails?: InstructorDetails
  relatedCourseIds?: string[]
  language?: string
  certificateIncluded?: boolean
  lastUpdated?: string

  // Add score property used in recommendations
  score?: number
}

export interface CourseCurriculum {
  modules: CourseModule[]
  totalDuration: string
  totalLessons: number
}

export interface CourseModule {
  id: string
  title: string
  description?: string
  duration: string
  lessons: CourseLesson[]
}

export interface CourseLesson {
  id: string
  title: string
  duration: string
  type: "video" | "quiz" | "assignment" | "reading"
  isFree?: boolean
  description?: string
}

export interface CourseReview {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  date: string
  helpful?: number
  response?: {
    from: string
    comment: string
    date: string
  }
}

export interface InstructorDetails {
  id: string
  name: string
  avatar: string
  bio: string
  title: string
  rating: number
  coursesCount: number
  studentsCount: number
  reviewsCount: number
  website?: string
  social?: {
    twitter?: string
    linkedin?: string
    youtube?: string
    github?: string
  }
}

export interface PaginatedCourses {
  courses: Course[]
  totalCourses: number
  totalPages: number
  currentPage: number
}

export interface CourseSearchParams {
  page?: number
  limit?: number
  search?: string
  category?: string
  level?: string
  sort?: "newest" | "popular" | "price-low" | "price-high" | "rating"
}

export interface PaginatedReviews {
  reviews: CourseReview[]
  totalReviews: number
  totalPages: number
  currentPage: number
  averageRating: number
  ratingCounts: {
    [key: number]: number
  }
}
