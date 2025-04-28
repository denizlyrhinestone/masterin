import { NextResponse } from "next/server"
import { checkAnalyticsStatus } from "@/lib/analytics"
import { NEXT_PUBLIC_ENABLE_ANALYTICS } from "@/lib/env-config"

export async function GET() {
  // Get the current analytics status
  const status = {
    enabled: NEXT_PUBLIC_ENABLE_ANALYTICS,
    environmentVariable: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS || "not set",
    details: checkAnalyticsStatus(),
  }

  return NextResponse.json(status)
}
