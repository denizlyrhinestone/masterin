"use server"

import { z } from "zod"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { revalidatePath } from "next/cache"
import { generateVerificationToken, sendVerificationEmail } from "@/lib/auth-utils"

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

// Define validation schema for user registration with robust validation
const userSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        passwordRegex,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
    confirmPassword: z.string(),
    fullName: z.string().min(2, "Please enter your full name"),
    role: z.enum(["student", "educator"]),
    gradeLevel: z.string().optional(),
    educatorTitle: z.string().optional(),
    educatorBio: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export type UserRegistrationData = z.infer<typeof userSchema>

/**
 * Server action to register a new user with enhanced validation and error handling
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
      confirmPassword: formData.get("confirmPassword") as string,
      fullName: formData.get("fullName") as string,
      role: formData.get("role") as string,
      gradeLevel: formData.get("gradeLevel") as string,
      educatorTitle: formData.get("educatorTitle") as string,
      educatorBio: formData.get("educatorBio") as string,
    }

    // Validate the data
    const validatedData = userSchema.parse(rawData)
    const isEducator = validatedData.role === "educator"

    // Check if email is already in use
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", validatedData.email)
      .single()

    if (existingUser) {
      return {
        success: false,
        error: "This email is already registered. Please use a different email or try logging in.",
        field: "email",
      }
    }

    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
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
      // Create user profile with default values
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
          last_login: new Date().toISOString(),
          account_status: "active",
          verification_attempts: 0,
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

      // Generate verification token and send verification email
      try {
        const token = await generateVerificationToken(authData.user.id)
        await sendVerificationEmail(validatedData.email, token)

        // Record the verification attempt
        await supabase.from("verification_activity").insert({
          user_id: authData.user.id,
          activity_type: "verification_sent",
          created_at: new Date().toISOString(),
        })
      } catch (error) {
        console.error("Error generating verification token:", error)
        // We continue even if token generation fails, as the user is still created
      }

      // Revalidate relevant paths
      revalidatePath("/admin/users")

      return {
        success: true,
        userId: authData.user.id,
        message: "Registration successful! Please check your email to verify your account.",
      }
    }

    return {
      success: false,
      error: "Failed to create user account",
    }
  } catch (error) {
    console.error("Error in registerUser:", error)
    if (error instanceof z.ZodError) {
      // Format Zod errors into a more user-friendly format
      const firstError = error.errors[0]
      return {
        success: false,
        error: firstError.message,
        field: firstError.path.join("."),
      }
    }

    return {
      success: false,
      error: "An unexpected error occurred during registration. Please try again.",
    }
  }
}
