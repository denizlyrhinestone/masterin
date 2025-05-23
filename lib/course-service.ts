import { supabase } from "@/lib/supabase"
import type { Course, Subject, GradeLevel } from "@/types"

interface GetCoursesParams {
  query?: string
  subject?: string
  gradeLevel?: string
  sort?: "newest" | "popular" | "rating"
  page?: number
  limit?: number
}

export async function getCourses({
  query,
  subject,
  gradeLevel,
  sort = "newest",
  page = 1,
  limit = 10,
}: GetCoursesParams = {}) {
  try {
    let queryBuilder = supabase.from("courses").select(`
        *,
        subject:subjects(id, name),
        gradeLevel:grade_levels(id, name)
      `)

    // Apply filters
    if (query) {
      queryBuilder = queryBuilder.ilike("title", `%${query}%`)
    }

    if (subject) {
      queryBuilder = queryBuilder.eq("subject_id", subject)
    }

    if (gradeLevel) {
      queryBuilder = queryBuilder.eq("grade_level_id", gradeLevel)
    }

    // Apply sorting
    switch (sort) {
      case "newest":
        queryBuilder = queryBuilder.order("created_at", { ascending: false })
        break
      case "popular":
        queryBuilder = queryBuilder.order("enrollment_count", { ascending: false })
        break
      case "rating":
        queryBuilder = queryBuilder.order("average_rating", { ascending: false })
        break
      default:
        queryBuilder = queryBuilder.order("created_at", { ascending: false })
    }

    // Get total count for pagination
    const { count } = await supabase.from("courses").select("*", { count: "exact", head: true })

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    queryBuilder = queryBuilder.range(from, to)

    const { data, error } = await queryBuilder

    if (error) throw error

    // Transform data to match Course type
    const courses: Course[] = data.map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      thumbnailUrl: course.thumbnail_url,
      durationMinutes: course.duration_minutes,
      lessonCount: course.lesson_count,
      subject: course.subject,
      gradeLevel: course.gradeLevel,
      averageRating: course.average_rating,
      enrollmentCount: course.enrollment_count,
      createdAt: course.created_at,
    }))

    return {
      courses,
      totalPages: Math.ceil((count || 0) / limit),
    }
  } catch (error) {
    console.error("Error fetching courses:", error)
    return { courses: [], totalPages: 0 }
  }
}

export async function getSubjects(): Promise<Subject[]> {
  try {
    const { data, error } = await supabase.from("subjects").select("*").order("name")

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error fetching subjects:", error)
    return []
  }
}

export async function getGradeLevels(): Promise<GradeLevel[]> {
  try {
    const { data, error } = await supabase.from("grade_levels").select("*").order("order")

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error fetching grade levels:", error)
    return []
  }
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select(`
        *,
        subject:subjects(id, name),
        gradeLevel:grade_levels(id, name)
      `)
      .eq("slug", slug)
      .single()

    if (error) throw error

    if (!data) return null

    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      description: data.description,
      thumbnailUrl: data.thumbnail_url,
      durationMinutes: data.duration_minutes,
      lessonCount: data.lesson_count,
      subject: data.subject,
      gradeLevel: data.gradeLevel,
      averageRating: data.average_rating,
      enrollmentCount: data.enrollment_count,
      createdAt: data.created_at,
      content: data.content,
      requirements: data.requirements,
      objectives: data.objectives,
      instructorId: data.instructor_id,
      instructorName: data.instructor_name,
      instructorBio: data.instructor_bio,
      instructorAvatarUrl: data.instructor_avatar_url,
    }
  } catch (error) {
    console.error("Error fetching course by slug:", error)
    return null
  }
}

// Get user enrollments
export async function getUserEnrollments(userId: string) {
  try {
    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        *,
        course:courses(
          *,
          subject:subjects(id, name),
          gradeLevel:grade_levels(id, name)
        )
      `)
      .eq("user_id", userId)
      .order("enrolled_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching user enrollments:", error)
    return []
  }
}

// Enroll in a course
export async function enrollInCourse(userId: string, courseId: number) {
  try {
    // Check if already enrolled
    const { data: existingEnrollment, error: checkError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      throw checkError
    }

    if (existingEnrollment) {
      return { success: true, message: "Already enrolled in this course" }
    }

    // Create new enrollment
    const { error } = await supabase.from("enrollments").insert({
      user_id: userId,
      course_id: courseId,
      enrolled_at: new Date().toISOString(),
      completion_percentage: 0,
      is_completed: false,
    })

    if (error) throw error

    // Update course enrollment count
    await supabase.rpc("increment_enrollment_count", { course_id: courseId })

    return { success: true, message: "Successfully enrolled in course" }
  } catch (error) {
    console.error("Error enrolling in course:", error)
    return { success: false, message: "Failed to enroll in course" }
  }
}

// Unenroll from a course
export async function unenrollFromCourse(userId: string, courseId: number) {
  try {
    const { error } = await supabase.from("enrollments").delete().eq("user_id", userId).eq("course_id", courseId)

    if (error) throw error

    // Update course enrollment count
    await supabase.rpc("decrement_enrollment_count", { course_id: courseId })

    return { success: true, message: "Successfully unenrolled from course" }
  } catch (error) {
    console.error("Error unenrolling from course:", error)
    return { success: false, message: "Failed to unenroll from course" }
  }
}

// Update lesson progress
export async function updateLessonProgress(
  userId: string,
  lessonId: number,
  data: {
    isCompleted?: boolean
    timeSpentSeconds?: number
    notes?: string
  },
) {
  try {
    const { isCompleted, timeSpentSeconds = 0, notes } = data

    // Check if progress record exists
    const { data: existingProgress, error: checkError } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError
    }

    const now = new Date().toISOString()

    if (existingProgress) {
      // Update existing progress
      const updateData: any = {
        last_accessed_at: now,
      }

      if (isCompleted !== undefined) {
        updateData.is_completed = isCompleted
        if (isCompleted && !existingProgress.completed_at) {
          updateData.completed_at = now
        }
      }

      if (timeSpentSeconds > 0) {
        updateData.time_spent_seconds = existingProgress.time_spent_seconds + timeSpentSeconds
      }

      if (notes !== undefined) {
        updateData.notes = notes
      }

      const { error } = await supabase.from("lesson_progress").update(updateData).eq("id", existingProgress.id)

      if (error) throw error
    } else {
      // Create new progress record
      const { error } = await supabase.from("lesson_progress").insert({
        user_id: userId,
        lesson_id: lessonId,
        is_completed: isCompleted || false,
        last_accessed_at: now,
        completed_at: isCompleted ? now : null,
        time_spent_seconds: timeSpentSeconds,
        notes,
      })

      if (error) throw error
    }

    // Update course completion percentage
    if (isCompleted) {
      await updateCourseCompletionPercentage(userId, lessonId)
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating lesson progress:", error)
    return { success: false, message: "Failed to update lesson progress" }
  }
}

// Helper function to update course completion percentage
async function updateCourseCompletionPercentage(userId: string, lessonId: number) {
  try {
    // Get the course ID for this lesson
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select("course_id")
      .eq("id", lessonId)
      .single()

    if (lessonError) throw lessonError

    const courseId = lesson.course_id

    // Get total lessons in the course
    const { count: totalLessons, error: countError } = await supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })
      .eq("course_id", courseId)

    if (countError) throw countError

    // Get completed lessons
    const { count: completedLessons, error: completedError } = await supabase
      .from("lesson_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_completed", true)
      .in("lesson_id", supabase.from("lessons").select("id").eq("course_id", courseId))

    if (completedError) throw completedError

    // Calculate percentage
    const completionPercentage = Math.round((completedLessons / totalLessons) * 100)
    const isCompleted = completionPercentage === 100

    // Update enrollment record
    await supabase
      .from("enrollments")
      .update({
        completion_percentage: completionPercentage,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq("user_id", userId)
      .eq("course_id", courseId)

    return { success: true }
  } catch (error) {
    console.error("Error updating course completion:", error)
    return { success: false }
  }
}

// Get lesson by slug
export async function getLessonBySlug(courseSlug: string, lessonSlug: string, userId?: string) {
  try {
    // First get the course
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title, slug")
      .eq("slug", courseSlug)
      .single()

    if (courseError) throw courseError

    // Then get the lesson
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select(`
        *,
        exercises:exercises(*)
      `)
      .eq("course_id", course.id)
      .eq("slug", lessonSlug)
      .single()

    if (lessonError) throw lessonError

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
      .order("order_index")

    if (adjacentError) throw adjacentError

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
  } catch (error) {
    console.error("Error fetching lesson by slug:", error)
    return null
  }
}

// Submit course review
export async function submitCourseReview(userId: string, courseId: number, rating: number, reviewText?: string) {
  try {
    // Check if user has already reviewed this course
    const { data: existingReview, error: checkError } = await supabase
      .from("course_reviews")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError
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

      if (error) throw error
    } else {
      // Create new review
      const { error } = await supabase.from("course_reviews").insert({
        user_id: userId,
        course_id: courseId,
        rating,
        review_text: reviewText,
        created_at: new Date().toISOString(),
      })

      if (error) throw error
    }

    // Update course average rating
    await updateCourseAverageRating(courseId)

    return { success: true, message: "Review submitted successfully" }
  } catch (error) {
    console.error("Error submitting course review:", error)
    return { success: false, message: "Failed to submit review" }
  }
}

// Helper function to update course average rating
async function updateCourseAverageRating(courseId: number) {
  try {
    // Calculate average rating
    const { data, error } = await supabase.from("course_reviews").select("rating").eq("course_id", courseId)

    if (error) throw error

    if (!data || data.length === 0) return

    const sum = data.reduce((acc, review) => acc + review.rating, 0)
    const average = sum / data.length

    // Update course
    await supabase
      .from("courses")
      .update({
        average_rating: average,
        review_count: data.length,
      })
      .eq("id", courseId)

    return { success: true }
  } catch (error) {
    console.error("Error updating course average rating:", error)
    return { success: false }
  }
}
