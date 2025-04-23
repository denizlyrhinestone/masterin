import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Paths that require admin authentication
const ADMIN_PATHS = ["/admin", "/api/admin"]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Only run this middleware for admin paths
  if (!ADMIN_PATHS.some((prefix) => path.startsWith(prefix))) {
    return NextResponse.next()
  }

  // Check if admin email is configured
  const adminEmail = process.env.ADMIN_EMAIL
  const isConfigured = !!adminEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)

  if (!isConfigured) {
    // For API routes, return a JSON error
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "Admin functionality is not available" }, { status: 503 })
    }

    // For page routes, redirect to an error page
    const url = new URL("/admin-unavailable", request.url)
    return NextResponse.redirect(url)
  }

  try {
    // Get the auth cookie
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    // We can't use createServerSupabaseClient here as it uses next/headers
    // Instead, we'll check for the session cookie and redirect if not present
    const authCookie = request.cookies.get("sb-auth-token")

    // If no auth cookie, redirect to login
    if (!authCookie) {
      const redirectUrl = new URL("/auth/sign-in", request.url)
      redirectUrl.searchParams.set("redirect", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // For now, we'll just check if the cookie exists and allow the request
    // The actual admin check will happen in the API routes or page components
    return NextResponse.next()
  } catch (error) {
    console.error("Error in admin middleware:", error)

    // For API routes, return a JSON error
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 })
    }

    // For page routes, redirect to an error page
    const url = new URL("/error", request.url)
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
