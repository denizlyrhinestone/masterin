export interface Course {
  id: string
  title: string
  slug: string
  description: string
  thumbnailUrl?: string
  durationMinutes?: number
  lessonCount?: number
  subject?: Subject
  gradeLevel?: GradeLevel
  averageRating?: number
  enrollmentCount?: number
  createdAt: string
  content?: string
  requirements?: string[]
  objectives?: string[]
  instructorId?: string
  instructorName?: string
  instructorBio?: string
  instructorAvatarUrl?: string
}

export interface Subject {
  id: string
  name: string
}

export interface GradeLevel {
  id: string
  name: string
  order: number
}

export interface Lesson {
  id: string
  title: string
  slug: string
  courseId: string
  description?: string
  content?: string
  videoUrl?: string
  duration?: number
  order: number
}

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  role: "student" | "instructor" | "admin"
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  enrolledAt: string
  completedAt?: string
  progress: number
}

export interface Review {
  id: string
  userId: string
  courseId: string
  rating: number
  comment?: string
  createdAt: string
  userName?: string
  userAvatarUrl?: string
}

export interface LessonProgress {
  id: string
  userId: string
  lessonId: string
  courseId: string
  completed: boolean
  completedAt?: string
  progress: number
}
