"use server"

import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { revalidatePath } from "next/cache"
import {
  verifyEmailToken,
  consumeVerificationToken,
  updateEmailVerificationStatus,
  incrementVerificationAttempts,
  checkVerificationAttempts,
  generateVerificationToken,
  sendVerificationEmail,
} from "@/lib/auth-utils"

/**
 * Server action to verify a user's email
 */
export async function verifyUserEmail(token: string) {
  try {
    // Verify the token
    const result = await verifyEmailToken(token)

    if (!result.valid) {
      // Handle different error cases
      if (result.expired) {
        return {
          success: false,
          error: "Verification link has expired. Please request a new verification email.",
          status: "expired",
          userId: result.userId,
          email: result.email,
        }
      }

      if (result.alreadyUsed) {
        // Check if the user's email is already verified
        if (result.userId) {
          const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
              cookies: {
                get(name: string) {
                  return cookies().get(name)?.value
                },
                set(name: string, value: string, options: any) {
                  cookies().set(name, value, options)
                },
                remove(name: string, options: any) {
                  cookies().delete(name, options)
                },
              },
            },
          )

          const { data } = await supabase.from("profiles").select("email_verified").eq("id", result.userId).single()

          if (data?.email_verified) {
            return {
              success: false,
              error: "Your email has already been verified. You can now log in.",
              status: "already-verified",
              userId: result.userId,
              email: result.email,
            }
          }
        }

        return {
          success: false,
          error: "This verification link has already been used. Please request a new one if needed.",
          status: "already-used",
          userId: result.userId,
          email: result.email,
        }
      }

      return {
        success: false,
        error: "Invalid verification link. Please request a new verification email.",
        status: "invalid",
      }
    }

    // Check if user has exceeded verification attempts
    if (result.userId) {
      const exceededAttempts = await checkVerificationAttempts(result.userId)
      if (exceededAttempts) {
        return {
          success: false,
          error: "You've exceeded the maximum number of verification attempts. Please contact support.",
          status: "exceeded-attempts",
          userId: result.userId,
          email: result.email,
        }
      }

      // Increment verification attempts
      await incrementVerificationAttempts(result.userId)
    }

    // Consume the token
    const consumed = await consumeVerificationToken(token)
    if (!consumed) {
      return {
        success: false,
        error: "Failed to process verification. Please try again.",
        status: "error",
      }
    }

    // Update user's email verification status
    if (result.userId) {
      const updated = await updateEmailVerificationStatus(result.userId)
      if (!updated) {
        return {
          success: false,
          error: "Failed to verify email. Please try again.",
          status: "error",
        }
      }
    }

    // Revalidate relevant paths
    revalidatePath("/admin/users")
    revalidatePath("/dashboard")
    revalidatePath("/profile")

    return {
      success: true,
      message: "Email verified successfully!",
      userId: result.userId,
      email: result.email,
    }
  } catch (error) {
    console.error("Error in verifyUserEmail:", error)
    return {
      success: false,
      error: "An unexpected error occurred during email verification.",
      status: "error",
    }
  }
}

/**
 * Server action to resend verification email
 */
export async function resendVerificationEmail(email: string) {
  try {
    // Check if we have rate limiting data
    const localStorage = typeof window !== "undefined" ? window.localStorage : null
    if (localStorage) {
      const lastSent = localStorage.getItem(`lastEmailSent_${email}`)
      if (lastSent) {
        const lastSentDate = new Date(lastSent)
        const now = new Date()
        const diffMinutes = (now.getTime() - lastSentDate.getTime()) / (1000 * 60)

        // Rate limit: only allow one email every 5 minutes
        if (diffMinutes < 5) {
          return {
            success: false,
            error: `Please wait ${Math.ceil(5 - diffMinutes)} more minute(s) before requesting another email`,
            retryAfter: Math.ceil(5 - diffMinutes),
          }
        }
      }
    }

    // Create Supabase server client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookies().set(name, value, options)
          },
          remove(name: string, options: any) {
            cookies().delete(name, options)
          },
        },
      },
    )

    // Find user by email
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id, email_verified, verification_attempts")
      .eq("email", email)
      .single()

    if (userError || !userData) {
      return {
        success: false,
        error: "No account found with this email address. Please check the email or create a new account.",
        status: "not-found",
      }
    }

    // Check if email is already verified
    if (userData.email_verified) {
      return {
        success: false,
        error: "This email address has already been verified. You can now log in.",
        status: "already-verified",
      }
    }

    // Check if user has exceeded verification attempts
    if (userData.verification_attempts >= 5) {
      return {
        success: false,
        error: "You've exceeded the maximum number of verification attempts. Please contact support.",
        status: "exceeded-attempts",
      }
    }

    // Generate new verification token
    const token = await generateVerificationToken(userData.id)

    // Send verification email
    const emailSent = await sendVerificationEmail(email, token)

    if (!emailSent) {
      return {
        success: false,
        error: "Failed to send verification email. Please try again later.",
        status: "error",
      }
    }

    // Update verification attempts
    await supabase
      .from("profiles")
      .update({
        verification_attempts: userData.verification_attempts + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userData.id)

    // Record the verification attempt
    await supabase.from("verification_activity").insert({
      user_id: userData.id,
      activity_type: "verification_resent",
      created_at: new Date().toISOString(),
    })

    // Set rate limiting data
    if (localStorage) {
      localStorage.setItem(`lastEmailSent_${email}`, new Date().toISOString())
    }

    return {
      success: true,
      message: "Verification email sent successfully. Please check your inbox.",
      userId: userData.id,
    }
  } catch (error) {
    console.error("Error in resendVerificationEmail:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
      status: "error",
    }
  }
}
