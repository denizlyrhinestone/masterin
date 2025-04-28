import { NextResponse } from "next/server"
import { validateGroqApiKey } from "@/lib/env-config"

export async function GET() {
  // Server-side validation of API key format
  const keyValidation = validateGroqApiKey()

  return NextResponse.json({
    status: keyValidation.valid ? "available" : "unavailable",
    message: keyValidation.message,
    timestamp: new Date().toISOString(),
  })
}
