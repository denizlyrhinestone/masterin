import { executeQuery } from "./index"
import { logger } from "../logger"
import { SchemaError } from "./errors"

// Database schema version tracking
const CURRENT_SCHEMA_VERSION = "1.0.0"

// Schema initialization function with comprehensive error handling
export async function initializeDatabase(): Promise<boolean> {
  try {
    logger.info("Initializing database schema")

    // Check if schema_versions table exists
    const schemaVersionsExist = await checkTableExists("schema_versions")

    if (!schemaVersionsExist) {
      logger.info("Creating schema_versions table")
      await executeQuery(
        `
        CREATE TABLE schema_versions (
          id SERIAL PRIMARY KEY,
          version VARCHAR(50) NOT NULL,
          applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          description TEXT
        )
      `,
        [],
        { critical: true },
      )
    }

    // Check current schema version
    const currentVersion = await getCurrentSchemaVersion()

    if (currentVersion === CURRENT_SCHEMA_VERSION) {
      logger.info(`Database schema is up to date (version ${CURRENT_SCHEMA_VERSION})`)
      return true
    }

    // Apply migrations as needed
    if (!currentVersion) {
      logger.info("Initializing database schema from scratch")
      await applyInitialSchema()
    } else {
      logger.info(`Upgrading database schema from ${currentVersion} to ${CURRENT_SCHEMA_VERSION}`)
      await applyMigrations(currentVersion)
    }

    // Update schema version
    await executeQuery(
      `INSERT INTO schema_versions (version, description) VALUES ($1, $2)`,
      [CURRENT_SCHEMA_VERSION, `Schema update to version ${CURRENT_SCHEMA_VERSION}`],
      { critical: true },
    )

    logger.info(`Database schema initialized successfully to version ${CURRENT_SCHEMA_VERSION}`)
    return true
  } catch (error) {
    const err = error as Error
    logger.error("Failed to initialize database schema", {
      error: err.message,
      stack: err.stack,
    })
    return false
  }
}

// Check if a table exists
async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const result = await executeQuery(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      ) as exists`,
      [tableName],
      { critical: true },
    )

    return result[0]?.exists === true
  } catch (error) {
    const err = error as Error
    logger.error(`Failed to check if table ${tableName} exists`, {
      error: err.message,
    })
    return false
  }
}

// Get current schema version
async function getCurrentSchemaVersion(): Promise<string | null> {
  try {
    const schemaVersionsExist = await checkTableExists("schema_versions")

    if (!schemaVersionsExist) {
      return null
    }

    const result = await executeQuery(`SELECT version FROM schema_versions ORDER BY applied_at DESC LIMIT 1`, [], {
      critical: true,
    })

    return result[0]?.version || null
  } catch (error) {
    const err = error as Error
    logger.error("Failed to get current schema version", {
      error: err.message,
    })
    return null
  }
}

// Apply initial schema
async function applyInitialSchema(): Promise<boolean> {
  try {
    logger.info("Applying initial database schema")

    // Use a transaction for atomicity
    await executeQuery("BEGIN", [], { critical: true })

    try {
      // AI interactions table
      await executeQuery(
        `
        CREATE TABLE ai_interactions (
          id SERIAL PRIMARY KEY,
          user_id_hash VARCHAR(64) NOT NULL,
          interaction_type VARCHAR(50) NOT NULL,
          input_text TEXT NOT NULL,
          output_text TEXT NOT NULL,
          success BOOLEAN NOT NULL DEFAULT true,
          response_time_ms INTEGER,
          metadata JSONB,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        )
      `,
        [],
        { critical: true },
      )

      // Create indexes for performance
      await executeQuery("CREATE INDEX idx_ai_interactions_user_id_hash ON ai_interactions(user_id_hash)", [], {
        critical: true,
      })

      await executeQuery("CREATE INDEX idx_ai_interactions_created_at ON ai_interactions(created_at)", [], {
        critical: true,
      })

      await executeQuery(
        "CREATE INDEX idx_ai_interactions_type_success ON ai_interactions(interaction_type, success)",
        [],
        { critical: true },
      )

      // AI feedback table
      await executeQuery(
        `
        CREATE TABLE ai_feedback (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(64) NOT NULL,
          message_id VARCHAR(64) NOT NULL,
          is_positive BOOLEAN NOT NULL,
          feedback_text TEXT,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        )
      `,
        [],
        { critical: true },
      )

      // Create indexes for feedback table
      await executeQuery("CREATE INDEX idx_ai_feedback_message_id ON ai_feedback(message_id)", [], { critical: true })

      await executeQuery("CREATE INDEX idx_ai_feedback_created_at ON ai_feedback(created_at)", [], { critical: true })

      await executeQuery("CREATE INDEX idx_ai_feedback_user_id ON ai_feedback(user_id)", [], { critical: true })

      // AI performance metrics table
      await executeQuery(
        `
        CREATE TABLE ai_performance_metrics (
          id SERIAL PRIMARY KEY,
          date DATE NOT NULL,
          total_interactions INTEGER NOT NULL DEFAULT 0,
          success_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
          average_response_time NUMERIC(10,2) NOT NULL DEFAULT 0,
          p95_response_time NUMERIC(10,2),
          p99_response_time NUMERIC(10,2),
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          CONSTRAINT unique_date UNIQUE(date)
        )
      `,
        [],
        { critical: true },
      )

      // Commit transaction
      await executeQuery("COMMIT", [], { critical: true })
      logger.info("Initial database schema applied successfully")
      return true
    } catch (error) {
      // Rollback transaction on error
      await executeQuery("ROLLBACK", [], { critical: true })
      throw error
    }
  } catch (error) {
    const err = error as Error
    logger.error("Failed to apply initial database schema", {
      error: err.message,
      stack: err.stack,
    })
    throw new SchemaError(`Failed to apply initial schema: ${err.message}`)
  }
}

// Apply migrations based on current version
async function applyMigrations(currentVersion: string): Promise<boolean> {
  // This would contain version-specific migrations
  // For now, we'll just log that no migrations are needed
  logger.info(`No migrations needed from version ${currentVersion} to ${CURRENT_SCHEMA_VERSION}`)
  return true
}

// Function to validate database schema
export async function validateDatabaseSchema(): Promise<{
  valid: boolean
  issues: string[]
}> {
  const issues: string[] = []

  try {
    logger.info("Validating database schema")

    // Check if required tables exist
    const requiredTables = ["ai_interactions", "ai_feedback", "ai_performance_metrics", "schema_versions"]

    for (const table of requiredTables) {
      const exists = await checkTableExists(table)
      if (!exists) {
        issues.push(`Required table '${table}' does not exist`)
      }
    }

    // Check if required indexes exist
    const requiredIndexes = [
      { table: "ai_interactions", index: "idx_ai_interactions_user_id_hash" },
      { table: "ai_interactions", index: "idx_ai_interactions_created_at" },
      { table: "ai_feedback", index: "idx_ai_feedback_message_id" },
      { table: "ai_feedback", index: "idx_ai_feedback_created_at" },
    ]

    for (const { table, index } of requiredIndexes) {
      const indexExists = await checkIndexExists(table, index)
      if (!indexExists) {
        issues.push(`Required index '${index}' on table '${table}' does not exist`)
      }
    }

    // Check schema version
    const currentVersion = await getCurrentSchemaVersion()
    if (currentVersion !== CURRENT_SCHEMA_VERSION) {
      issues.push(`Schema version mismatch: current is ${currentVersion}, expected ${CURRENT_SCHEMA_VERSION}`)
    }

    return {
      valid: issues.length === 0,
      issues,
    }
  } catch (error) {
    const err = error as Error
    logger.error("Failed to validate database schema", {
      error: err.message,
      stack: err.stack,
    })

    issues.push(`Schema validation failed: ${err.message}`)

    return {
      valid: false,
      issues,
    }
  }
}

// Check if an index exists
async function checkIndexExists(tableName: string, indexName: string): Promise<boolean> {
  try {
    const result = await executeQuery(
      `SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = $1 
        AND indexname = $2
      ) as exists`,
      [tableName, indexName],
      { critical: true },
    )

    return result[0]?.exists === true
  } catch (error) {
    const err = error as Error
    logger.error(`Failed to check if index ${indexName} exists on table ${tableName}`, {
      error: err.message,
    })
    return false
  }
}
