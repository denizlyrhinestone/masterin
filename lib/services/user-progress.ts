import { executeQuery, toCamelCase } from "@/lib/db"

export interface UserProgress {
  id: string
  userId: string
  lessonId: string
  status: "not_started" | "in_progress" | "completed"
  progressPercentage: number
  lastAccessedAt: Date
  completedAt?: Date
}

export async function getUserLessonProgress(userId: string, lessonId: string): Promise<UserProgress | null> {
  try {
    const progress = await executeQuery<UserProgress>(
      "SELECT * FROM user_progress WHERE user_id = $1 AND lesson_id = $2",
      [userId, lessonId],
    )

    if (progress.length === 0) {
      return null
    }

    return toCamelCase<UserProgress>(progress[0])
  } catch (error) {
    console.error("Error getting user lesson progress:", error)
    return null
  }
}

export async function updateUserProgress(
  userId: string,
  lessonId: string,
  status: "not_started" | "in_progress" | "completed",
  progressPercentage: number,
): Promise<UserProgress | null> {
  try {
    // Check if progress record exists
    const existingProgress = await getUserLessonProgress(userId, lessonId)

    let result

    if (existingProgress) {
      // Update existing record
      const completedAt = status === "completed" ? "CURRENT_TIMESTAMP" : null

      result = await executeQuery<UserProgress>(
        `UPDATE user_progress 
         SET status = $1, progress_percentage = $2, last_accessed_at = CURRENT_TIMESTAMP,
             completed_at = ${completedAt ? completedAt : "completed_at"}
         WHERE user_id = $3 AND lesson_id = $4
         RETURNING *`,
        [status, progressPercentage, userId, lessonId],
      )
    } else {
      // Create new record
      const completedAt = status === "completed" ? "CURRENT_TIMESTAMP" : null

      result = await executeQuery<UserProgress>(
        `INSERT INTO user_progress (user_id, lesson_id, status, progress_percentage, completed_at)
         VALUES ($1, $2, $3, $4, ${completedAt ? "CURRENT_TIMESTAMP" : "NULL"})
         RETURNING *`,
        [userId, lessonId, status, progressPercentage],
      )
    }

    if (result.length === 0) {
      return null
    }

    return toCamelCase<UserProgress>(result[0])
  } catch (error) {
    console.error("Error updating user progress:", error)
    return null
  }
}

export async function getCourseCompletionPercentage(userId: string, courseId: string): Promise<number> {
  try {
    // Get total number of lessons in the course
    const totalLessonsResult = await executeQuery<{ count: string }>(
      "SELECT COUNT(*) as count FROM lessons WHERE course_id = $1",
      [courseId],
    )

    const totalLessons = Number.parseInt(totalLessonsResult[0].count, 10)

    if (totalLessons === 0) {
      return 0
    }

    // Get number of completed lessons
    const completedLessonsResult = await executeQuery<{ count: string }>(
      `SELECT COUNT(*) as count FROM user_progress up
       JOIN lessons l ON up.lesson_id = l.id
       WHERE up.user_id = $1 AND l.course_id = $2 AND up.status = 'completed'`,
      [userId, courseId],
    )

    const completedLessons = Number.parseInt(completedLessonsResult[0].count, 10)

    // Calculate percentage
    return Math.round((completedLessons / totalLessons) * 100)
  } catch (error) {
    console.error("Error calculating course completion percentage:", error)
    return 0
  }
}
