// Import the base DatabaseError from the main errors file
import { DatabaseError as BaseDatabaseError } from "../errors"

export class SchemaError extends BaseDatabaseError {
  constructor(message: string, details: any = {}) {
    super(message, "SCHEMA_ERROR", details)
    this.name = "SchemaError"
  }
}

export class ConnectionError extends BaseDatabaseError {
  constructor(message: string, details: any = {}) {
    super(message, "CONNECTION_ERROR", details)
    this.name = "ConnectionError"
  }
}

export class QueryError extends BaseDatabaseError {
  constructor(message: string, details: any = {}) {
    super(message, "QUERY_ERROR", details)
    this.name = "QueryError"
  }
}

// Re-export the base DatabaseError for convenience
export { BaseDatabaseError as DatabaseError }
