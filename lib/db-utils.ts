import { createClient } from "@supabase/supabase-js"
import { logError } from "./error-logger"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Create clients with different permission levels
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Safe query execution with parameterized queries
 * @param queryFn Function that executes the query using Supabase client
 * @returns Result of the query or error
 */
export async function safeQuery<T>(
  queryFn: (client: typeof supabaseClient) => Promise<{ data: T | null; error: any }>,
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const result = await queryFn(supabaseClient)

    if (result.error) {
      throw result.error
    }

    return { data: result.data, error: null }
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), {
      severity: "medium",
      tags: ["database", "query"],
      context: { query: queryFn.toString() },
    })

    return {
      data: null,
      error: error instanceof Error ? error : new Error("Database query failed"),
    }
  }
}

/**
 * Execute a parameterized query with admin privileges
 * @param queryFn Function that executes the query using Supabase admin client
 * @returns Result of the query or error
 */
export async function adminQuery<T>(
  queryFn: (client: typeof supabaseAdmin) => Promise<{ data: T | null; error: any }>,
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const result = await queryFn(supabaseAdmin)

    if (result.error) {
      throw result.error
    }

    return { data: result.data, error: null }
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), {
      severity: "high",
      tags: ["database", "admin", "query"],
      context: { query: queryFn.toString() },
    })

    return {
      data: null,
      error: error instanceof Error ? error : new Error("Admin database query failed"),
    }
  }
}

/**
 * Safely get a count of records
 * @param table Table name
 * @param column Column to count
 * @param filter Optional filter condition
 * @returns Count of records
 */
export async function getCount(table: string, column = "*", filter?: { column: string; value: any }): Promise<number> {
  try {
    let query = supabaseClient.from(table).select(column, { count: "exact" })

    if (filter) {
      query = query.eq(filter.column, filter.value)
    }

    const { count, error } = await query

    if (error) throw error

    return count || 0
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), {
      severity: "low",
      tags: ["database", "count"],
      context: { table, column, filter },
    })

    return 0
  }
}

/**
 * Transaction helper for Supabase
 * @param operations Array of operations to perform in transaction
 * @returns Success status and any errors
 */
export async function transaction(
  operations: ((client: typeof supabaseClient) => Promise<any>)[],
): Promise<{ success: boolean; errors: Error[] }> {
  const errors: Error[] = []
  let success = true

  // Start a PostgreSQL transaction
  const { error: beginError } = await supabaseClient.rpc("begin_transaction")

  if (beginError) {
    return {
      success: false,
      errors: [new Error(`Failed to begin transaction: ${beginError.message}`)],
    }
  }

  try {
    // Execute all operations
    for (const operation of operations) {
      const result = await operation(supabaseClient)
      if (result?.error) {
        throw result.error
      }
    }

    // Commit the transaction
    const { error: commitError } = await supabaseClient.rpc("commit_transaction")

    if (commitError) {
      throw commitError
    }
  } catch (error) {
    success = false
    errors.push(error instanceof Error ? error : new Error(String(error)))

    // Rollback the transaction
    const { error: rollbackError } = await supabaseClient.rpc("rollback_transaction")

    if (rollbackError) {
      errors.push(new Error(`Rollback failed: ${rollbackError.message}`))
    }
  }

  return { success, errors }
}

/**
 * Create stored procedures for transaction management
 * This should be run once during database setup
 */
export async function setupTransactionProcedures(): Promise<void> {
  const { error } = await supabaseAdmin.rpc("setup_transaction_procedures", {
    sql: `
      CREATE OR REPLACE FUNCTION begin_transaction() RETURNS void AS $$
      BEGIN
        EXECUTE 'BEGIN';
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      
      CREATE OR REPLACE FUNCTION commit_transaction() RETURNS void AS $$
      BEGIN
        EXECUTE 'COMMIT';
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      
      CREATE OR REPLACE FUNCTION rollback_transaction() RETURNS void AS $$
      BEGIN
        EXECUTE 'ROLLBACK';
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `,
  })

  if (error) {
    logError(new Error(`Failed to set up transaction procedures: ${error.message}`), {
      severity: "high",
      tags: ["database", "setup"],
    })
  }
}
