import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { generateVerificationToken, sendVerificationEmail } from "@/lib/auth"

// This endpoint will be called by a scheduled job (e.g., Vercel Cron)
export async function POST(request: Request) {
  try {
    // Verify the request is authorized (e.g., using a secret key)
    const { headers } = request
    const authHeader = headers.get("authorization")

    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Get users with unverified emails who registered more than 24 hours ago
    // but less than 7 days ago (to avoid spamming)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: unverifiedUsers, error } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("email_verified", false)
      .lt("created_at", oneDayAgo.toISOString())
      .gt("created_at", sevenDaysAgo.toISOString())

    if (error) {
      console.error("Error fetching unverified users:", error)
      return NextResponse.json({ error: "Failed to fetch unverified users" }, { status: 500 })
    }

    // Send reminder emails
    const results = await Promise.all(
      unverifiedUsers.map(async (user) => {
        try {
          // Generate a new verification token
          const token = await generateVerificationToken(user.id)

          // Send the verification email
          await sendVerificationEmail(user.email, token)

          return { userId: user.id, success: true }
        } catch (error) {
          console.error(`Error sending reminder to user ${user.id}:`, error)
          return { userId: user.id, success: false, error }
        }
      }),
    )

    // Return the results
    return NextResponse.json({
      sent: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      total: results.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in verification reminder job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
