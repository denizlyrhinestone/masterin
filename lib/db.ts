import { neon, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Configure neon to use fetch polyfill
neonConfig.fetchConnectionCache = true

// Create a mock SQL client for when the database is unavailable
const createMockSqlClient = () => {
  console.warn("Using mock SQL client - database functionality will be limited")
  return {
    query: async () => [],
  }
}

// Track database connection status
let isDatabaseAvailable = true
let connectionAttempted = false

// Initialize SQL client with error handling
let sql: any

try {
  // Use DATABASE_URL as the primary connection string, falling back to NEON_DATABASE_URL if available
  const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL

  if (!connectionString) {
    console.warn("Database connection string not found. Using mock SQL client.")
    sql = createMockSqlClient()
    isDatabaseAvailable = false
    connectionAttempted = true
  } else {
    sql = neon(connectionString)
  }
} catch (error) {
  console.error("Failed to initialize database connection:", error)
  sql = createMockSqlClient()
  isDatabaseAvailable = false
  connectionAttempted = true
}

// Create drizzle client
export const db = drizzle(sql)

// Execute a raw SQL query with robust error handling
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  try {
    // If we've already determined the database is unavailable, don't attempt the query
    if (!isDatabaseAvailable && connectionAttempted) {
      console.warn("Skipping database query because database is unavailable")
      return []
    }

    // Use sql.query instead of direct function call
    const result = (await sql.query(query, params)) as T[]

    // If we get here, the database is available
    if (!connectionAttempted) {
      isDatabaseAvailable = true
      connectionAttempted = true
    }

    return result
  } catch (error) {
    console.error("Database query error:", error)

    // Mark database as unavailable if we get a connection error
    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      isDatabaseAvailable = false
      connectionAttempted = true
    }

    // Return empty array for SELECT queries
    if (query.trim().toLowerCase().startsWith("select")) {
      return []
    }

    // For other queries, return empty array instead of throwing
    return []
  }
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

// Helper function to convert camelCase to snake_case for database queries
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

// Helper function to check if we're in a preview environment
export function isPreviewEnvironment(): boolean {
  // Check for Vercel preview environment
  return (
    process.env.VERCEL_ENV === "preview" ||
    Boolean(process.env.VERCEL_URL?.includes("vercel.app")) ||
    !isDatabaseAvailable
  )
}

// Get database availability status
export function getDatabaseStatus(): { available: boolean; attempted: boolean } {
  return { available: isDatabaseAvailable, attempted: connectionAttempted }
}
