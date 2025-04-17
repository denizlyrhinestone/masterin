import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { getDatabaseStatus, testDatabaseConnection } from "@/lib/db"
import { validateDatabaseSchema } from "@/lib/db/schema"

// Simple admin authentication middleware
async function authenticateAdmin(req: Request): Promise<boolean> {
  // In a real application, this would check for admin credentials
  // For now, we'll just check for a special header
  const adminKey = req.headers.get("x-admin-key")

  // In production, use a proper authentication mechanism
  return adminKey === process.env.ADMIN_API_KEY
}

export async function GET(req: Request) {
  try {
    // Authenticate the request
    const isAuthenticated = await authenticateAdmin(req)
    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: "UNAUTHORIZED",
          message: "Unauthorized access",
        },
        { status: 401 },
      )
    }

    // Get database status
    const status = getDatabaseStatus()

    // Test database connection
    const connectionTest = await testDatabaseConnection()

    // Validate database schema
    const schemaValidation = await validateDatabaseSchema()

    return NextResponse.json({
      success: true,
      status,
      connectionTest,
      schemaValidation,
    })
  } catch (error) {
    const err = error as Error
    logger.error("Database status API error", {
      error: err.message,
      stack: err.stack,
    })

    return NextResponse.json(
      {
        success: false,
        error: "REQUEST_PROCESSING_ERROR",
        message: "An error occurred while checking database status",
      },
      { status: 500 },
    )
  }
}
