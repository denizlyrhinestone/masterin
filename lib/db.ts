import { neon, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Configure neon to use fetch polyfill
neonConfig.fetchConnectionCache = true

// Create SQL client using the environment variable
// Use DATABASE_URL as the primary connection string, falling back to NEON_DATABASE_URL if available
const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
if (!connectionString) {
  throw new Error(
    "Database connection string not found. Please set DATABASE_URL or NEON_DATABASE_URL environment variable.",
  )
}

const sql = neon(connectionString)

// Create drizzle client
export const db = drizzle(sql)

// Execute a raw SQL query
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  try {
    // Use sql.query instead of direct function call
    return (await sql.query(query, params)) as T[]
  } catch (error) {
    console.error("Database query error:", error)
    throw error
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
