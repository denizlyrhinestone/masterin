import { NextResponse } from "next/server"
import { verifyAdminConfig } from "@/lib/admin-utils"
import { ENABLE_ADMIN_FEATURES, ENABLE_AI_FEATURES } from "@/lib/env-config"

export async function GET() {
  try {
    const adminConfig = verifyAdminConfig()

    return NextResponse.json({
      adminConfig,
      features: {
        adminEnabled: ENABLE_ADMIN_FEATURES,
        aiEnabled: ENABLE_AI_FEATURES,
      },
    })
  } catch (error) {
    console.error("Error verifying admin configuration:", error)
    return NextResponse.json(
      {
        error: "An error occurred while verifying admin configuration",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    )
  }
}
