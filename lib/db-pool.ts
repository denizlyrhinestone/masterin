import { createPool, type Pool } from "@neondatabase/serverless"

// Singleton pattern for database connection pool
let pool: Pool | null = null

export function getDbPool(): Pool {
  if (!pool) {
    // Create a new pool if one doesn't exist
    const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL

    if (!connectionString) {
      throw new Error("Database connection string not found in environment variables")
    }

    pool = createPool({
      connectionString,
      maxConnections: 10, // Adjust based on your application needs
      idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    })
  }

  return pool
}

// Helper function for parameterized queries to prevent SQL injection
export async function executeQuery<T>(query: string, params: any[] = []): Promise<T[]> {
  const db = getDbPool()

  try {
    const result = await db.query(query, params)
    return result.rows as T[]
  } catch (error) {
    console.error("Database query error:", error)
    throw new Error(`Database operation failed: ${(error as Error).message}`)
  }
}

// Helper function for single row queries
export async function querySingle<T>(query: string, params: any[] = []): Promise<T | null> {
  const results = await executeQuery<T>(query, params)
  return results.length > 0 ? results[0] : null
}

// Helper function for transactions
export async function executeTransaction<T>(queries: { query: string; params: any[] }[]): Promise<T[][]> {
  const db = getDbPool()
  const client = await db.connect()

  try {
    await client.query("BEGIN")

    const results: T[][] = []
    for (const { query, params } of queries) {
      const result = await client.query(query, params)
      results.push(result.rows as T[])
    }

    await client.query("COMMIT")
    return results
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Transaction error:", error)
    throw new Error(`Transaction failed: ${(error as Error).message}`)
  } finally {
    client.release()
  }
}
