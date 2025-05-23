// Static course data
const courses = [
  {
    id: 1,
    slug: "sample-course",
    title: "Sample Course",
    description: "This is a sample course for demonstration purposes.",
    image: "/course-placeholder.png",
    instructor: "John Doe",
    duration: "4 weeks",
    level: "Beginner",
    price: 49.99,
    rating: 4.5,
    reviewCount: 120,
    enrolledCount: 1500,
    lessons: [
      {
        id: 1,
        slug: "introduction",
        title: "Introduction",
        description: "An introduction to the course.",
        content: "<p>Welcome to the course! This is the introduction.</p>",
        duration: 15,
        order: 1,
      },
      {
        id: 2,
        slug: "getting-started",
        title: "Getting Started",
        description: "Learn the basics to get started.",
        content: "<p>Let's get started with the basics.</p>",
        duration: 25,
        order: 2,
      },
    ],
  },
]

// Get all courses
export async function getAllCourses() {
  return courses
}

// Get course by slug
export async function getCourseBySlug(slug: string) {
  return courses.find((course) => course.slug === slug) || null
}

// Get lesson by slug
export async function getLessonBySlug(courseSlug: string, lessonSlug: string, userId?: string) {
  const course = courses.find((course) => course.slug === courseSlug)
  if (!course) return null

  const lesson = course.lessons.find((lesson) => lesson.slug === lessonSlug)
  if (!lesson) return null

  const lessonIndex = course.lessons.findIndex((l) => l.id === lesson.id)
  const previousLesson = lessonIndex > 0 ? course.lessons[lessonIndex - 1] : null
  const nextLesson = lessonIndex < course.lessons.length - 1 ? course.lessons[lessonIndex + 1] : null

  // Mock progress data
  const progress = {
    completed: false,
    lastAccessed: new Date().toISOString(),
    timeSpent: 0,
  }

  return {
    course,
    lesson,
    progress,
    previousLesson,
    nextLesson,
  }
}

// Get lesson by ID
export async function getLessonById(id: number) {
  for (const course of courses) {
    const lesson = course.lessons.find((lesson) => lesson.id === id)
    if (lesson) return lesson
  }
  return null
}

// Add the missing exports
export async function getUserEnrollments(userId: string) {
  // Mock implementation
  return [
    {
      courseId: 1,
      userId,
      enrolledAt: new Date().toISOString(),
      progress: 30,
      lastAccessed: new Date().toISOString(),
    },
  ]
}

export async function enrollInCourse(userId: string, courseId: number) {
  // Mock implementation
  return {
    success: true,
    message: "Successfully enrolled in course",
    enrollment: {
      courseId,
      userId,
      enrolledAt: new Date().toISOString(),
      progress: 0,
      lastAccessed: new Date().toISOString(),
    },
  }
}

export async function unenrollFromCourse(userId: string, courseId: number) {
  // Mock implementation
  return {
    success: true,
    message: "Successfully unenrolled from course",
  }
}

export async function submitCourseReview(userId: string, courseId: number, rating: number, comment: string) {
  // Mock implementation
  return {
    success: true,
    message: "Review submitted successfully",
    review: {
      id: Math.floor(Math.random() * 1000),
      userId,
      courseId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    },
  }
}

export async function updateLessonProgress(userId: string, lessonId: number, completed: boolean, timeSpent: number) {
  // Mock implementation
  return {
    success: true,
    message: "Progress updated successfully",
    progress: {
      userId,
      lessonId,
      completed,
      timeSpent,
      updatedAt: new Date().toISOString(),
    },
  }
}
