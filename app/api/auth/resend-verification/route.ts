import { NextResponse } from "next/server"
import { resendVerificationEmail } from "@/app/actions/auth-actions"

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  try {
    const result = await resendVerificationEmail(email)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: result.message })
  } catch (error) {
    console.error("Error resending verification email:", error)
    return NextResponse.json({ error: "Failed to resend verification email" }, { status: 500 })
  }
}
