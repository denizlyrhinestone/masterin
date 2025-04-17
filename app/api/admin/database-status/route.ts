import { NextResponse } from "next/server"
import { headers } from "next/headers"

// This would normally connect to your actual database
async function checkDatabaseConnection() {
  try {
    // Simulate database connection check
    // In a real app, you would use your database client to test the connection
    if (process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL) {
      return { success: true, message: "Database connected successfully" }
    } else {
      return { success: false, message: "Database connection string not found" }
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown database error",
    }
  }
}

export async function GET() {
  const headersList = headers()
  const adminKey = headersList.get("x-admin-key")

  // Check if the admin key is valid
  if (adminKey !== process.env.ADMIN_API_KEY) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const dbStatus = await checkDatabaseConnection()

  return NextResponse.json({
    ...dbStatus,
    timestamp: new Date().toISOString(),
  })
}
