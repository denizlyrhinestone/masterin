import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { revalidatePath } from "next/cache"
import { generateVerificationToken, sendVerificationEmail } from "@/lib/auth-utils"

export async function verifyUserEmail(token: string) {
  const supabase = createServerClient({
    cookies: () => cookies(),
  })

  try {
    const { data: tokenData, error: tokenError } = await supabase
      .from("verification_tokens")
      .select("*")
      .eq("token", token)
      .single()

    if (tokenError || !tokenData) {
      return { success: false, error: "Invalid verification token" }
    }

    const expiresAt = new Date(tokenData.expires_at)
    const now = new Date()

    if (now > expiresAt) {
      return { success: false, error: "Verification token has expired" }
    }

    if (tokenData.used) {
      return { success: false, error: "Verification token has already been used" }
    }

    await supabase.from("verification_tokens").update({ used: true }).eq("token", token)

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ email_verified: true, updated_at: new Date().toISOString() })
      .eq("id", tokenData.user_id)

    if (profileError) {
      console.error("Error updating profile:", profileError)
      return { success: false, error: "Failed to verify email" }
    }

    revalidatePath("/admin/users")

    return { success: true, userId: tokenData.user_id, email: tokenData.email }
  } catch (error) {
    console.error("Error in verifyUserEmail:", error)
    return { success: false, error: "An unexpected error occurred during email verification" }
  }
}

export async function resendVerificationEmail(email: string) {
  const supabase = createServerClient({
    cookies: () => cookies(),
  })

  try {
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single()

    if (userError || !userData) {
      return { success: false, error: "User not found" }
    }

    const token = await generateVerificationToken(userData.id)
    const emailSent = await sendVerificationEmail(email, token)

    if (!emailSent) {
      return {
        success: false,
        error: "Failed to send verification email",
      }
    }

    return {
      success: true,
      message: "Verification email sent successfully",
    }
  } catch (error) {
    console.error("Error in resendVerificationEmail:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}
