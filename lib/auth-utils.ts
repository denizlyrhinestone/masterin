// lib/auth-utils.ts

import { v4 as uuidv4 } from "uuid"

/**
 * Generates a unique verification token for a given user ID.
 * @param userId - The ID of the user to generate the token for.
 * @returns The generated verification token.
 */
export const generateVerificationToken = async (userId: string): Promise<string> => {
  const token = uuidv4()
  const expiresAt = new Date(new Date().getTime() + 5 * 60 * 60 * 1000) // Expires in 5 hours

  // Create Supabase client (avoiding import to prevent errors)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const createClient = (supabaseUrl: string, supabaseKey: string) => {
    return {
      from: (table: string) => {
        return {
          insert: (data: any) => {
            return fetch(`${supabaseUrl}/rest/v1/${table}`, {
              method: "POST",
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                "Content-Type": "application/json",
                Prefer: "return=minimal",
              },
              body: JSON.stringify(data),
            }).then((res) => res.json())
          },
        }
      },
    }
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Store the token in the database
  await supabase.from("verification_tokens").insert({
    token,
    user_id: userId,
    expires_at: expiresAt.toISOString(),
    email: "", // Email will be populated by trigger
    used: false,
  })

  return token
}

/**
 * Sends a verification email to the given email address.
 * @param email - The email address to send the verification email to.
 * @param token - The verification token to include in the email.
 * @returns A promise that resolves when the email is sent.
 */
export const sendVerificationEmail = async (email: string, token: string): Promise<boolean> => {
  // Construct the verification URL
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`

  // In a real application, you would use a dedicated email sending service like SendGrid or Mailgun.
  // For this example, we'll just log the email details to the console.
  console.log(`Sending verification email to ${email} with URL: ${verificationUrl}`)

  // Simulate email sending (replace with actual email sending logic)
  try {
    // Simulate a successful email send
    return true
  } catch (error) {
    console.error("Error sending verification email:", error)
    return false
  }
}
