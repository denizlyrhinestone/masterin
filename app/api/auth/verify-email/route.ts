import { NextResponse } from "next/server"
import { verifyUserEmail } from "@/app/actions/auth-actions"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing-token", request.url))
  }

  try {
    const result = await verifyUserEmail(token)

    if (!result.success) {
      // Handle different error cases
      let redirectUrl = "/login?error=" + result.error

      if (result.status === "expired") {
        redirectUrl = `/resend-verification?error=${result.error}&email=${result.email}`
      }

      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    // Redirect to success page
    return NextResponse.redirect(new URL("/login?success=email-verified", request.url))
  } catch (error) {
    console.error("Error verifying email:", error)
    return NextResponse.redirect(new URL("/login?error=server-error", request.url))
  }
}
