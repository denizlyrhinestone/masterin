import { supabase, supabaseAdmin, handleSupabaseError } from "@/lib/supabase"
import type { Course, Lesson, LessonProgress, SearchParams, PaginatedResult } from "@/types"

// Get all subjects
export async function getSubjects() {
  const { data, error } = await supabase.from("subjects").select("*").order("name")

  if (error) handleSupabaseError(error)
  return data || []
}

// Get all grade levels
export async function getGradeLevels() {
  const { data, error } = await supabase.from("grade_levels").select("*").order("level_order")

  if (error) handleSupabaseError(error)
  return data || []
}

// Get featured courses
export async function getFeaturedCourses(limit = 6) {
  const { data, error } = await supabase
    .from("courses")
    .select(`
      *,
      subject:subjects(*),
      grade_level:grade_levels(*)
    `)
    .eq("is_featured", true)
    .eq("is_published", true)
    .limit(limit)

  if (error) handleSupabaseError(error)
  return data || []
}

// Search courses with pagination
export async function searchCourses(params: SearchParams): Promise<PaginatedResult<Course>> {
  const { query = "", subject = "", gradeLevel = "", sort = "newest", page = 1, limit = 10 } = params

  let queryBuilder = supabase
    .from("courses")
    .select(
      `
      *,
      subject:subjects(*),
      grade_level:grade_levels(*),
      reviews:course_reviews(count),
      lessons:lessons(count)
    `,
      { count: "exact" },
    )
    .eq("is_published", true)

  // Apply filters
  if (query) {
    queryBuilder = queryBuilder.ilike("title", `%${query}%`)
  }

  if (subject) {
    queryBuilder = queryBuilder.eq("subjects.slug", subject)
  }

  if (gradeLevel) {
    queryBuilder = queryBuilder.eq("grade_levels.slug", gradeLevel)
  }

  // Apply sorting
  switch (sort) {
    case "popular":
      queryBuilder = queryBuilder.order("enrollments", { ascending: false })
      break
    case "rating":
      queryBuilder = queryBuilder.order("average_rating", { ascending: false })
      break
    case "newest":
    default:
      queryBuilder = queryBuilder.order("created_at", { ascending: false })
      break
  }

  // Apply pagination
  const from = (page - 1) * limit
  const to = from + limit - 1
  queryBuilder = queryBuilder.range(from, to)

  const { data, error, count } = await queryBuilder

  if (error) handleSupabaseError(error)

  // Process the data to include computed properties
  const processedData =
    data?.map((course) => ({
      ...course,
      reviewCount: course.reviews?.length || 0,
      lessonCount: course.lessons?.length || 0,
    })) || []

  return {
    data: processedData,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

// Get course by slug
export async function getCourseBySlug(slug: string, userId?: string) {
  const { data, error } = await supabase
    .from("courses")
    .select(`
      *,
      subject:subjects(*),
      grade_level:grade_levels(*),
      lessons:lessons(*, exercises:exercises(*)),
      materials:course_materials(*),
      reviews:course_reviews(*, user:profiles(first_name, last_name, avatar_url))
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (error) handleSupabaseError(error)

  // Get enrollment status if userId is provided
  let enrollment = null
  if (userId && data) {
    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", data.id)
      .single()

    if (!enrollmentError) {
      enrollment = enrollmentData
    }
  }

  // Get lesson progress if userId is provided
  let lessonProgress: Record<number, LessonProgress> = {}
  if (userId && data) {
    const { data: progressData, error: progressError } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("user_id", userId)
      .in(
        "lesson_id",
        data.lessons.map((lesson) => lesson.id),
      )

    if (!progressError && progressData) {
      lessonProgress = progressData.reduce(
        (acc, progress) => {
          acc[progress.lesson_id] = progress
          return acc
        },
        {} as Record<number, LessonProgress>,
      )
    }
  }

  // Calculate average rating
  const averageRating = data?.reviews?.length
    ? data.reviews.reduce((sum, review) => sum + review.rating, 0) / data.reviews.length
    : 0

  // Mark lessons as completed based on progress
  const lessonsWithProgress = data?.lessons.map((lesson) => ({
    ...lesson,
    isCompleted: lessonProgress[lesson.id]?.is_completed || false,
  }))

  return {
    ...data,
    lessons: lessonsWithProgress || [],
    averageRating,
    reviewCount: data?.reviews?.length || 0,
    enrollment,
  }
}

// Get lesson by slug
export async function getLessonBySlug(courseSlug: string, lessonSlug: string, userId?: string) {
  // First get the course
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, title, slug")
    .eq("slug", courseSlug)
    .eq("is_published", true)
    .single()

  if (courseError) handleSupabaseError(courseError)

  // Then get the lesson
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select(`
      *,
      exercises:exercises(*)
    `)
    .eq("course_id", course.id)
    .eq("slug", lessonSlug)
    .eq("is_published", true)
    .single()

  if (lessonError) handleSupabaseError(lessonError)

  // Get lesson progress if userId is provided
  let progress = null
  if (userId) {
    const { data: progressData, error: progressError } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("lesson_id", lesson.id)
      .single()

    if (!progressError) {
      progress = progressData
    }
  }

  // Get next and previous lessons
  const { data: adjacentLessons, error: adjacentError } = await supabase
    .from("lessons")
    .select("id, title, slug, order_index")
    .eq("course_id", course.id)
    .eq("is_published", true)
    .order("order_index")

  if (adjacentError) handleSupabaseError(adjacentError)

  const currentIndex = adjacentLessons.findIndex((l) => l.id === lesson.id)
  const previousLesson = currentIndex > 0 ? adjacentLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < adjacentLessons.length - 1 ? adjacentLessons[currentIndex + 1] : null

  return {
    course,
    lesson,
    progress,
    previousLesson,
    nextLesson,
  }
}

// Enroll in a course
export async function enrollInCourse(userId: string, courseId: number) {
  const { error } = await supabase.from("enrollments").insert({
    user_id: userId,
    course_id: courseId,
    enrolled_at: new Date().toISOString(),
    completion_percentage: 0,
    is_completed: false,
  })

  if (error) {
    // If the error is a duplicate key error, the user is already enrolled
    if (error.code === "23505") {
      return { success: true, message: "Already enrolled in this course" }
    }
    handleSupabaseError(error)
  }

  return { success: true, message: "Successfully enrolled in course" }
}

// Unenroll from a course
export async function unenrollFromCourse(userId: string, courseId: number) {
  const { error } = await supabase.from("enrollments").delete().eq("user_id", userId).eq("course_id", courseId)

  if (error) handleSupabaseError(error)

  return { success: true, message: "Successfully unenrolled from course" }
}

// Update lesson progress
export async function updateLessonProgress(
  userId: string,
  lessonId: number,
  isCompleted: boolean,
  timeSpentSeconds: number,
  notes?: string,
) {
  // Check if progress record exists
  const { data: existingProgress, error: checkError } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .single()

  if (checkError && checkError.code !== "PGRST116") {
    // PGRST116 is the error code for "no rows returned"
    handleSupabaseError(checkError)
  }

  const now = new Date().toISOString()

  if (existingProgress) {
    // Update existing progress
    const { error } = await supabase
      .from("lesson_progress")
      .update({
        is_completed: isCompleted,
        last_accessed_at: now,
        completed_at: isCompleted ? now : existingProgress.completed_at,
        time_spent_seconds: existingProgress.time_spent_seconds + timeSpentSeconds,
        notes: notes || existingProgress.notes,
      })
      .eq("id", existingProgress.id)

    if (error) handleSupabaseError(error)
  } else {
    // Create new progress record
    const { error } = await supabase.from("lesson_progress").insert({
      user_id: userId,
      lesson_id: lessonId,
      is_completed: isCompleted,
      last_accessed_at: now,
      completed_at: isCompleted ? now : null,
      time_spent_seconds: timeSpentSeconds,
      notes,
    })

    if (error) handleSupabaseError(error)
  }

  return { success: true }
}

// Get user enrollments
export async function getUserEnrollments(userId: string) {
  const { data, error } = await supabase
    .from("enrollments")
    .select(`
      *,
      course:courses(
        *,
        subject:subjects(*),
        grade_level:grade_levels(*)
      )
    `)
    .eq("user_id", userId)
    .order("enrolled_at", { ascending: false })

  if (error) handleSupabaseError(error)
  return data || []
}

// Submit course review
export async function submitCourseReview(userId: string, courseId: number, rating: number, reviewText?: string) {
  // Check if user has already reviewed this course
  const { data: existingReview, error: checkError } = await supabase
    .from("course_reviews")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single()

  if (checkError && checkError.code !== "PGRST116") {
    handleSupabaseError(checkError)
  }

  if (existingReview) {
    // Update existing review
    const { error } = await supabase
      .from("course_reviews")
      .update({
        rating,
        review_text: reviewText,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingReview.id)

    if (error) handleSupabaseError(error)
  } else {
    // Create new review
    const { error } = await supabase.from("course_reviews").insert({
      user_id: userId,
      course_id: courseId,
      rating,
      review_text: reviewText,
    })

    if (error) handleSupabaseError(error)
  }

  return { success: true }
}

// Admin functions (using supabaseAdmin)

// Create or update a course
export async function saveCourse(course: Partial<Course> & { id?: number }) {
  if (course.id) {
    // Update existing course
    const { error } = await supabaseAdmin
      .from("courses")
      .update({
        title: course.title,
        slug: course.slug,
        description: course.description,
        subject_id: course.subjectId,
        grade_level_id: course.gradeLevelId,
        thumbnail_url: course.thumbnailUrl,
        duration_minutes: course.durationMinutes,
        is_featured: course.isFeatured,
        is_published: course.isPublished,
        common_core_alignment: course.commonCoreAlignment,
        prerequisites: course.prerequisites,
        learning_objectives: course.learningObjectives,
        materials_needed: course.materialsNeeded,
        updated_at: new Date().toISOString(),
      })
      .eq("id", course.id)

    if (error) handleSupabaseError(error)
    return { id: course.id }
  } else {
    // Create new course
    const { data, error } = await supabaseAdmin
      .from("courses")
      .insert({
        title: course.title,
        slug: course.slug,
        description: course.description,
        subject_id: course.subjectId,
        grade_level_id: course.gradeLevelId,
        thumbnail_url: course.thumbnailUrl,
        duration_minutes: course.durationMinutes,
        is_featured: course.isFeatured || false,
        is_published: course.isPublished || false,
        common_core_alignment: course.commonCoreAlignment,
        prerequisites: course.prerequisites,
        learning_objectives: course.learningObjectives,
        materials_needed: course.materialsNeeded,
        created_by: course.createdBy,
      })
      .select("id")
      .single()

    if (error) handleSupabaseError(error)
    return { id: data?.id }
  }
}

// Create or update a lesson
export async function saveLesson(lesson: Partial<Lesson> & { courseId: number; id?: number }) {
  if (lesson.id) {
    // Update existing lesson
    const { error } = await supabaseAdmin
      .from("lessons")
      .update({
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.description,
        content: lesson.content,
        duration_minutes: lesson.durationMinutes,
        order_index: lesson.orderIndex,
        is_published: lesson.isPublished,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lesson.id)

    if (error) handleSupabaseError(error)
    return { id: lesson.id }
  } else {
    // Create new lesson
    const { data, error } = await supabaseAdmin
      .from("lessons")
      .insert({
        course_id: lesson.courseId,
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.description,
        content: lesson.content,
        duration_minutes: lesson.durationMinutes,
        order_index: lesson.orderIndex,
        is_published: lesson.isPublished || false,
      })
      .select("id")
      .single()

    if (error) handleSupabaseError(error)
    return { id: data?.id }
  }
}
