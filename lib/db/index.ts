import { neon, neonConfig, type NeonQueryFunction } from "@neondatabase/serverless"
import { logger } from "../logger"
import { DatabaseError } from "../errors"
import { drizzle } from "drizzle-orm/neon-http"

// Configure neon to use fetch polyfill
neonConfig.fetchConnectionCache = true

// Database connection state tracking
interface DbState {
  isAvailable: boolean
  connectionAttempted: boolean
  lastConnectionAttempt: number
  consecutiveFailures: number
  lastError: Error | null
}

// Database state with detailed tracking
const dbState: DbState = {
  isAvailable: true,
  connectionAttempted: false,
  lastConnectionAttempt: 0,
  consecutiveFailures: 0,
  lastError: null,
}

// Constants for connection management
const CONNECTION_RETRY_THRESHOLD = 5 // Max consecutive failures before cooling off
const CONNECTION_RETRY_COOLDOWN = 60000 // 1 minute cooldown after multiple failures

// Create a mock SQL client for when the database is unavailable
const createMockSqlClient = () => {
  logger.warn("Using mock SQL client - database functionality will be limited")
  return {
    query: async () => {
      logger.debug("Mock SQL client executed a query")
      return []
    },
  }
}

// Initialize SQL client with enhanced error handling
let sql: NeonQueryFunction<any, any>
let connectionString: string | undefined

try {
  // Use DATABASE_URL as the primary connection string, falling back to NEON_DATABASE_URL
  connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL

  if (!connectionString) {
    logger.error("Database connection string not found. Using mock SQL client.")
    sql = createMockSqlClient() as any
    dbState.isAvailable = false
    dbState.connectionAttempted = true
  } else {
    // Validate connection string format
    if (!connectionString.startsWith("postgres://") && !connectionString.startsWith("postgresql://")) {
      throw new Error(`Invalid database connection string format: ${connectionString.substring(0, 10)}...`)
    }

    logger.info("Initializing database connection")
    sql = neon(connectionString)
  }
} catch (error) {
  const err = error as Error
  logger.error("Failed to initialize database connection:", {
    error: err.message,
    stack: err.stack,
  })
  sql = createMockSqlClient() as any
  dbState.isAvailable = false
  dbState.connectionAttempted = true
  dbState.lastError = err
}

// Create drizzle client
export const db = drizzle(sql)

// Enhanced executeQuery with detailed error handling and retry logic
export async function executeQuery<T = any>(
  query: string,
  params: any[] = [],
  options: {
    retryCount?: number
    retryDelay?: number
    critical?: boolean // Mark if this query is critical and should throw on failure
  } = {},
): Promise<T[]> {
  const { retryCount = 2, retryDelay = 500, critical = false } = options

  // Check if we should attempt database connection
  const now = Date.now()
  if (!dbState.isAvailable && dbState.connectionAttempted) {
    // If we've had too many consecutive failures, implement a cooldown period
    if (
      dbState.consecutiveFailures >= CONNECTION_RETRY_THRESHOLD &&
      now - dbState.lastConnectionAttempt < CONNECTION_RETRY_COOLDOWN
    ) {
      logger.debug("Skipping database query due to cooldown period", {
        consecutiveFailures: dbState.consecutiveFailures,
        timeSinceLastAttempt: now - dbState.lastConnectionAttempt,
        cooldownPeriod: CONNECTION_RETRY_COOLDOWN,
      })

      if (critical) {
        throw new DatabaseError(
          "Database connection is currently unavailable due to repeated failures",
          "CONNECTION_COOLDOWN",
          { consecutiveFailures: dbState.consecutiveFailures },
        )
      }

      return []
    }
  }

  // Track connection attempt
  dbState.lastConnectionAttempt = now
  dbState.connectionAttempted = true

  // Attempt query with retries
  let lastError: Error | null = null
  let attempt = 0

  while (attempt <= retryCount) {
    try {
      // If not first attempt, apply delay with exponential backoff
      if (attempt > 0) {
        const backoffDelay = retryDelay * Math.pow(2, attempt - 1)
        logger.debug(`Retry attempt ${attempt}/${retryCount} after ${backoffDelay}ms delay`)
        await new Promise((resolve) => setTimeout(resolve, backoffDelay))
      }

      // Log query for debugging (sanitize sensitive data)
      const sanitizedQuery = query.replace(/password\s*=\s*['"].*?['"]/gi, "password='[REDACTED]'")
      logger.debug("Executing SQL query", {
        query: sanitizedQuery,
        paramCount: params.length,
        attempt: attempt + 1,
      })

      // Execute query
      const result = (await sql.query(query, params)) as T[]

      // Reset failure counter on success
      dbState.consecutiveFailures = 0
      dbState.isAvailable = true
      dbState.lastError = null

      logger.debug("Query executed successfully", {
        rowCount: result.length,
      })

      return result
    } catch (error) {
      const err = error as Error
      lastError = err
      dbState.consecutiveFailures++
      dbState.lastError = err

      // Log detailed error information
      logger.error(`Database query error (attempt ${attempt + 1}/${retryCount + 1})`, {
        error: err.message,
        stack: err.stack,
        query: query.substring(0, 200) + (query.length > 200 ? "..." : ""),
        params: JSON.stringify(params).substring(0, 200),
      })

      // Check for specific error types to determine if retry is worthwhile
      const errorMessage = err.message.toLowerCase()
      const isTransientError =
        errorMessage.includes("connection") ||
        errorMessage.includes("timeout") ||
        errorMessage.includes("temporarily unavailable")

      if (!isTransientError) {
        logger.warn("Non-transient database error detected, skipping further retries")
        break // Exit retry loop for non-transient errors
      }

      attempt++
    }
  }

  // If we've exhausted all retries or encountered a non-transient error
  dbState.isAvailable = false

  if (critical) {
    throw new DatabaseError(`Database query failed after ${attempt} attempts: ${lastError?.message}`, "QUERY_FAILED", {
      attempts: attempt,
      lastError: lastError?.message,
    })
  }

  // For non-critical queries, return empty result
  logger.warn("Returning empty result after query failure")
  return []
}

// Helper function to convert camelCase to snake_case for database queries
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

// Helper function to convert snake_case database fields to camelCase
export function toCamelCase<T extends Record<string, any>>(obj: Record<string, any>): T {
  const result: Record<string, any> = {}

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      result[camelKey] = obj[key]
    }
  }

  return result as T
}

// Enhanced environment detection with more reliable checks
export function isPreviewEnvironment(): boolean {
  // Check multiple indicators of preview environments
  const isVercelPreview = process.env.VERCEL_ENV === "preview"
  const isVercelUrl = Boolean(process.env.VERCEL_URL?.includes("vercel.app"))
  const isDatabaseUnavailable = !dbState.isAvailable && dbState.connectionAttempted

  // Log the detection for debugging
  logger.debug("Environment detection", {
    isVercelPreview,
    isVercelUrl,
    isDatabaseUnavailable,
    vercelEnv: process.env.VERCEL_ENV,
  })

  return isVercelPreview || isVercelUrl || isDatabaseUnavailable
}

// Get detailed database status information
export function getDatabaseStatus(): {
  available: boolean
  attempted: boolean
  consecutiveFailures: number
  lastAttempt: number
  lastError: string | null
  connectionString: string | null
} {
  return {
    available: dbState.isAvailable,
    attempted: dbState.connectionAttempted,
    consecutiveFailures: dbState.consecutiveFailures,
    lastAttempt: dbState.lastConnectionAttempt,
    lastError: dbState.lastError?.message || null,
    connectionString: connectionString
      ? `${connectionString.substring(0, 10)}...` // Only show beginning for security
      : null,
  }
}

// Test database connection and return detailed status
export async function testDatabaseConnection(): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  try {
    // Simple query to test connection
    const result = await executeQuery("SELECT 1 as test", [], { critical: true })
    return {
      success: true,
      message: "Database connection successful",
      details: { result },
    }
  } catch (error) {
    const err = error as Error
    return {
      success: false,
      message: `Database connection failed: ${err.message}`,
      details: {
        error: err.message,
        stack: err.stack,
        status: getDatabaseStatus(),
      },
    }
  }
}
