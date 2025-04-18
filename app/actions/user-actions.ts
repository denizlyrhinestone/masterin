"use server"

import { z } from "zod"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { generateVerificationToken, sendVerificationEmail } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Define validation schema for user registration
const userSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Please enter your full name"),
  role: z.enum(["student", "educator"]),
  gradeLevel: z.string().optional(),
  educatorTitle: z.string().optional(),
  educatorBio: z.string().optional(),
})

export type UserRegistrationData = z.infer<typeof userSchema>

/**
 * Server action to register a new user
 */
export async function registerUser(formData: FormData) {
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

  try {
    // Parse and validate form data
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      fullName: formData.get("fullName") as string,
      role: formData.get("role") as string,
      gradeLevel: formData.get("gradeLevel") as string,
      educatorTitle: formData.get("educatorTitle") as string,
      educatorBio: formData.get("educatorBio") as string,
    }

    // Validate the data
    const validatedData = userSchema.parse(rawData)
    const isEducator = validatedData.role === "educator"

    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email`,
        data: {
          role: validatedData.role,
        },
      },
    })

    if (authError) {
      return {
        success: false,
        error: authError.message,
      }
    }

    if (authData.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: authData.user.id,
          email: validatedData.email,
          full_name: validatedData.fullName,
          role: validatedData.role,
          grade_level: validatedData.gradeLevel,
          educator_title: isEducator ? validatedData.educatorTitle : null,
          educator_bio: isEducator ? validatedData.educatorBio : null,
          educator_verified: isEducator ? false : null,
          email_verified: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (profileError) {
        console.error("Error creating profile:", profileError)
        return {
          success: false,
          error: "Failed to create user profile",
        }
      }

      // Generate verification token
      try {
        const token = await generateVerificationToken(authData.user.id)
        await sendVerificationEmail(validatedData.email, token)
      } catch (error) {
        console.error("Error generating verification token:", error)
        // Continue even if token generation fails, as the user is still created
      }

      // Revalidate relevant paths
      revalidatePath("/admin/users")

      return {
        success: true,
        userId: authData.user.id,
        message: "User registered successfully. Please check your email to verify your account.",
      }
    }

    return {
      success: false,
      error: "Failed to create user",
    }
  } catch (error) {
    console.error("Error in registerUser:", error)
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((err) => `${err.path}: ${err.message}`).join(", ")
      return {
        success: false,
        error: errorMessage,
      }
    }

    return {
      success: false,
      error: "An unexpected error occurred during registration",
    }
  }
}

/**
 * Server action to verify a user's email
 */
export async function verifyUserEmail(token: string) {
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

  try {
    // Get the token from the database
    const { data: tokenData, error: tokenError } = await supabase
      .from("verification_tokens")
      .select("*")
      .eq("token", token)
      .single()

    if (tokenError || !tokenData) {
      return {
        success: false,
        error: "Invalid verification token",
      }
    }

    // Check if token is expired
    const expiresAt = new Date(tokenData.expires_at)
    const now = new Date()

    if (now > expiresAt) {
      return {
        success: false,
        error: "Verification token has expired",
        expired: true,
        userId: tokenData.user_id,
      }
    }

    // Check if token is already used
    if (tokenData.used) {
      return {
        success: false,
        error: "Verification token has already been used",
        userId: tokenData.user_id,
      }
    }

    // Mark token as used
    await supabase.from("verification_tokens").update({ used: true }).eq("token", token)

    // Update user profile to mark email as verified
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        email_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tokenData.user_id)

    if (profileError) {
      console.error("Error updating profile:", profileError)
      return {
        success: false,
        error: "Failed to verify email",
      }
    }

    // Revalidate relevant paths
    revalidatePath("/admin/users")

    return {
      success: true,
      userId: tokenData.user_id,
      message: "Email verified successfully",
    }
  } catch (error) {
    console.error("Error in verifyUserEmail:", error)
    return {
      success: false,
      error: "An unexpected error occurred during email verification",
    }
  }
}

/**
 * Server action to resend verification email
 */
export async function resendVerificationEmail(email: string) {
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

  try {
    // Find user by email
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id, email_verified")
      .eq("email", email)
      .single()

    if (userError || !userData) {
      return {
        success: false,
        error: "User not found",
      }
    }

    // Check if email is already verified
    if (userData.email_verified) {
      return {
        success: false,
        error: "Email is already verified",
      }
    }

    // Generate new verification token
    const token = await generateVerificationToken(userData.id)

    // Send verification email
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
