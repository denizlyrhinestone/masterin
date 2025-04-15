import { type NextRequest, NextResponse } from "next/server"
import { verifyQStashSignature } from "@/lib/qstash-verify"
import { processDailyAnalytics } from "@/lib/course-analytics"

export async function POST(request: NextRequest) {
  try {
    // Verify that this request is coming from QStash
    const { isValid, body } = await verifyQStashSignature(request)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Process the daily analytics
    const result = await processDailyAnalytics()

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error processing daily analytics:", error)
    return NextResponse.json({ error: "Failed to process daily analytics" }, { status: 500 })
  }
}
