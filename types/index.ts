export type Role = "student" | "teacher" | "admin"

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: Role
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Subject {
  id: number
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  createdAt: string
  updatedAt: string
}

export interface GradeLevel {
  id: number
  name: string
  slug: string
  description?: string
  levelOrder: number
  createdAt: string
  updatedAt: string
}

export interface Course {
  id: number
  title: string
  slug: string
  description: string
  subjectId?: number
  subject?: Subject
  gradeLevelId?: number
  gradeLevel?: GradeLevel
  thumbnailUrl?: string
  durationMinutes?: number
  isFeatured: boolean
  isPublished: boolean
  commonCoreAlignment?: string
  prerequisites?: string
  learningObjectives?: string
  materialsNeeded?: string
  createdBy?: string
  createdAt: string
  updatedAt: string
  // Computed properties
  averageRating?: number
  reviewCount?: number
  lessonCount?: number
  enrollmentCount?: number
}

export interface Lesson {
  id: number
  courseId: number
  title: string
  slug: string
  description?: string
  content?: string
  durationMinutes?: number
  orderIndex: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
  // Computed properties
  isCompleted?: boolean
}

export type ExerciseType = "multiple_choice" | "fill_blank" | "matching" | "short_answer" | "essay" | "interactive"
export type ExerciseDifficulty = "easy" | "medium" | "hard"

export interface Exercise {
  id: number
  lessonId: number
  title: string
  description?: string
  content: string
  type: ExerciseType
  difficulty: ExerciseDifficulty
  orderIndex: number
  createdAt: string
  updatedAt: string
}

export interface Assessment {
  id: number
  courseId: number
  title: string
  description?: string
  passingScore: number
  timeLimitMinutes?: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
  questions?: AssessmentQuestion[]
}

export type QuestionType = "multiple_choice" | "true_false" | "short_answer" | "essay"

export interface AssessmentQuestion {
  id: number
  assessmentId: number
  question: string
  questionType: QuestionType
  options?: string[]
  correctAnswer?: string
  points: number
  orderIndex: number
  createdAt: string
  updatedAt: string
}

export interface Enrollment {
  id: number
  userId: string
  courseId: number
  enrolledAt: string
  lastAccessedAt?: string
  completionPercentage: number
  isCompleted: boolean
  completedAt?: string
  course?: Course
}

export interface LessonProgress {
  id: number
  userId: string
  lessonId: number
  isCompleted: boolean
  lastAccessedAt?: string
  completedAt?: string
  timeSpentSeconds: number
  notes?: string
  lesson?: Lesson
}

export interface AssessmentAttempt {
  id: number
  userId: string
  assessmentId: number
  startedAt: string
  completedAt?: string
  score?: number
  passed?: boolean
  answers?: Record<string, any>
  timeSpentSeconds?: number
  assessment?: Assessment
}

export interface CourseReview {
  id: number
  userId: string
  courseId: number
  rating: number
  reviewText?: string
  createdAt: string
  updatedAt: string
  user?: {
    firstName?: string
    lastName?: string
    avatarUrl?: string
  }
}

export interface CourseMaterial {
  id: number
  courseId: number
  title: string
  description?: string
  fileUrl?: string
  fileType?: string
  isDownloadable: boolean
  orderIndex: number
  createdAt: string
  updatedAt: string
}

export interface SearchParams {
  query?: string
  subject?: string
  gradeLevel?: string
  sort?: "newest" | "popular" | "rating"
  page?: number
  limit?: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
