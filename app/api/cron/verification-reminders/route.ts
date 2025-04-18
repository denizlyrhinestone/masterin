import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getUsersNeedingReminders, generateVerificationToken, sendVerificationEmail } from "@/lib/auth-utils"

/**
 * Cron job API endpoint to send email verification reminders
 * This endpoint will be called daily at noon by Vercel Cron
 */
export async function POST(request: Request) {
  try {
    // Verify the request is authorized using the CRON_SECRET_KEY
    const { headers } = request
    const authHeader = headers.get("authorization")

    if (authHeader !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Get users who need reminders
    const unverifiedUsers = await getUsersNeedingReminders()

    if (unverifiedUsers.length === 0) {
      return NextResponse.json({
        message: "No users need verification reminders at this time",
        sent: 0,
        total: 0,
        timestamp: new Date().toISOString(),
      })
    }

    // Send reminder emails with rate limiting
    // Process in batches to avoid overwhelming email service
    const batchSize = 20
    const batches = []

    for (let i = 0; i < unverifiedUsers.length; i += batchSize) {
      batches.push(unverifiedUsers.slice(i, i + batchSize))
    }

    const results = []

    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(async (user) => {
          try {
            // Check when the last reminder was sent
            const { data: lastReminder } = await supabase
              .from("verification_activity")
              .select("created_at")
              .eq("user_id", user.id)
              .eq("activity_type", "verification_reminder")
              .order("created_at", { ascending: false })
              .limit(1)

            // If a reminder was sent in the last 24 hours, skip this user
            if (lastReminder && lastReminder.length > 0) {
              const lastReminderDate = new Date(lastReminder[0].created_at)
              const now = new Date()
              const diffHours = (now.getTime() - lastReminderDate.getTime()) / (1000 * 60 * 60)

              if (diffHours < 24) {
                return {
                  userId: user.id,
                  email: user.email,
                  success: false,
                  skipped: true,
                  reason: "Recent reminder already sent",
                }
              }
            }

            // Generate a new verification token
            const token = await generateVerificationToken(user.id)

            // Send the verification email
            const emailSent = await sendVerificationEmail(user.email, token)

            if (emailSent) {
              // Record the reminder in the activity log
              await supabase.from("verification_activity").insert({
                user_id: user.id,
                activity_type: "verification_reminder",
                created_at: new Date().toISOString(),
              })

              // Increment verification attempts
              await supabase.rpc("increment_verification_attempts", {
                user_id: user.id,
              })
            }

            return {
              userId: user.id,
              email: user.email,
              success: emailSent,
              skipped: false,
            }
          } catch (error) {
            console.error(`Error sending reminder to user ${user.id}:`, error)
            return {
              userId: user.id,
              email: user.email,
              success: false,
              skipped: false,
              error,
            }
          }
        }),
      )

      results.push(...batchResults)

      // Add a small delay between batches to avoid rate limits
      if (batches.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    // Return the results
    return NextResponse.json({
      sent: results.filter((r) => r.success).length,
      skipped: results.filter((r) => r.skipped).length,
      failed: results.filter((r) => !r.success && !r.skipped).length,
      total: results.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in verification reminder job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
