import { executeQuery } from "./db"
import { logger } from "./logger"
import { hashUserId } from "./privacy"

// Interface for AI interaction data
interface AIInteraction {
  userId: string
  type: string
  input: string
  output: string
  success: boolean
  responseTimeMs?: number
  metadata?: any
}

// Log an AI interaction to the database
export async function logInteraction(interaction: AIInteraction): Promise<boolean> {
  try {
    // Hash the user ID for privacy
    const userIdHash = hashUserId(interaction.userId)

    // Sanitize metadata for storage
    const metadata = interaction.metadata ? JSON.stringify(interaction.metadata) : null

    // Insert the interaction into the database
    await executeQuery(
      `INSERT INTO ai_interactions 
        (user_id_hash, interaction_type, input_text, output_text, success, response_time_ms, metadata) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userIdHash,
        interaction.type,
        interaction.input,
        interaction.output,
        interaction.success,
        interaction.responseTimeMs || null,
        metadata,
      ],
    )

    logger.debug("Logged AI interaction", {
      type: interaction.type,
      success: interaction.success,
      responseTimeMs: interaction.responseTimeMs,
    })

    return true
  } catch (error) {
    logger.error("Failed to log AI interaction", { error, type: interaction.type })
    return false
  }
}

// Log user feedback on an AI message
export async function logFeedback(
  userId: string,
  messageId: string,
  isPositive: boolean,
  feedbackText?: string,
): Promise<boolean> {
  try {
    // Insert the feedback into the database
    await executeQuery(
      `INSERT INTO ai_feedback 
        (user_id, message_id, is_positive, feedback_text) 
       VALUES ($1, $2, $3, $4)`,
      [userId, messageId, isPositive, feedbackText || null],
    )

    logger.debug("Logged AI feedback", {
      messageId,
      isPositive,
    })

    return true
  } catch (error) {
    logger.error("Failed to log AI feedback", { error, messageId })
    return false
  }
}

// Get AI interaction statistics for a specific date range
export async function getInteractionStats(
  startDate: Date,
  endDate: Date,
): Promise<{
  totalInteractions: number
  successRate: number
  averageResponseTime: number
}> {
  try {
    const result = await executeQuery(
      `SELECT 
        COUNT(*) as total_interactions,
        AVG(CASE WHEN success = true THEN 1 ELSE 0 END) as success_rate,
        AVG(response_time_ms) as average_response_time
       FROM ai_interactions
       WHERE created_at BETWEEN $1 AND $2`,
      [startDate.toISOString(), endDate.toISOString()],
    )

    if (result.length === 0) {
      return {
        totalInteractions: 0,
        successRate: 0,
        averageResponseTime: 0,
      }
    }

    return {
      totalInteractions: Number.parseInt(result[0].total_interactions) || 0,
      successRate: Number.parseFloat(result[0].success_rate) || 0,
      averageResponseTime: Number.parseFloat(result[0].average_response_time) || 0,
    }
  } catch (error) {
    logger.error("Failed to get interaction stats", { error, startDate, endDate })
    return {
      totalInteractions: 0,
      successRate: 0,
      averageResponseTime: 0,
    }
  }
}

// Update daily performance metrics (to be run by a scheduled job)
export async function updateDailyMetrics(date: Date = new Date()): Promise<boolean> {
  try {
    // Set the date to the beginning of the day
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)

    // Set the date to the end of the day
    const endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)

    // Get the date string in YYYY-MM-DD format
    const dateStr = startDate.toISOString().split("T")[0]

    // Get interaction statistics for the day
    const stats = await executeQuery(
      `SELECT 
        COUNT(*) as total_interactions,
        AVG(CASE WHEN success = true THEN 1 ELSE 0 END) as success_rate,
        AVG(response_time_ms) as average_response_time,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_response_time,
        PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY response_time_ms) as p99_response_time
       FROM ai_interactions
       WHERE created_at BETWEEN $1 AND $2`,
      [startDate.toISOString(), endDate.toISOString()],
    )

    if (stats.length === 0) {
      logger.info("No interactions found for the day, skipping metrics update", { date: dateStr })
      return false
    }

    // Insert or update the metrics for the day
    await executeQuery(
      `INSERT INTO ai_performance_metrics 
        (date, total_interactions, success_rate, average_response_time, p95_response_time, p99_response_time) 
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (date) 
       DO UPDATE SET 
        total_interactions = $2,
        success_rate = $3,
        average_response_time = $4,
        p95_response_time = $5,
        p99_response_time = $6`,
      [
        dateStr,
        Number.parseInt(stats[0].total_interactions) || 0,
        Number.parseFloat(stats[0].success_rate) || 0,
        Number.parseFloat(stats[0].average_response_time) || 0,
        Number.parseFloat(stats[0].p95_response_time) || 0,
        Number.parseFloat(stats[0].p99_response_time) || 0,
      ],
    )

    logger.info("Updated daily metrics", {
      date: dateStr,
      totalInteractions: stats[0].total_interactions,
      successRate: stats[0].success_rate,
    })

    return true
  } catch (error) {
    logger.error("Failed to update daily metrics", { error, date })
    return false
  }
}
