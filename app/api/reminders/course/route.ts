import { type NextRequest, NextResponse } from "next/server"
import { verifyQStashSignature } from "@/lib/qstash-verify"
import { addNotification } from "@/lib/notifications"

export async function POST(request: NextRequest) {
  try {
    // Verify that this request is coming from QStash
    const { isValid, body } = await verifyQStashSignature(request)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Extract data from the verified message
    const { userId, courseId, courseTitle } = body

    if (!userId || !courseId || !courseTitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Add a notification for the user
    await addNotification(
      userId,
      "reminder",
      "Continue your learning journey",
      `You haven't visited "${courseTitle}" in a while. Ready to continue?`,
      `/classes/${courseId}`,
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing course reminder:", error)
    return NextResponse.json({ error: "Failed to process reminder" }, { status: 500 })
  }
}
