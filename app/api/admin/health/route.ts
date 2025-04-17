import { NextResponse } from "next/server"
import { headers } from "next/headers"

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

  return NextResponse.json({
    status: "ok",
    admin: true,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    logLevel: process.env.LOG_LEVEL,
  })
}
