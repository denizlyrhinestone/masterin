import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-auth"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  // Log the callback parameters for debugging
  console.log("Auth callback received:", {
    url: request.url,
    code: code ? "present" : "missing",
    error,
    errorDescription,
  })

  if (error) {
    console.error("Auth callback error:", error, errorDescription)
    // Redirect to error page with the error message
    return NextResponse.redirect(
      new URL(
        `/auth/error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || "")}`,
        requestUrl.origin,
      ),
    )
  }

  if (code) {
    try {
      const supabase = createServerSupabaseClient()
      await supabase.auth.exchangeCodeForSession(code)
    } catch (err) {
      console.error("Error exchanging code for session:", err)
      return NextResponse.redirect(new URL(`/auth/error?error=session_exchange_failed`, requestUrl.origin))
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
}
