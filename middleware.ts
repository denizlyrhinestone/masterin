import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  // Create a Supabase client using the more appropriate server-side method
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          // This is just for the middleware, we don't actually set cookies here
        },
        remove: (name, options) => {
          // This is just for the middleware, we don't actually remove cookies here
        },
      },
    },
  )

  // Get the pathname from the request
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/register",
    "/educator/register",
    "/educator/login",
    "/forgot-password",
    "/reset-password",
  ]

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

  // For API routes, we'll handle auth in the route handlers
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Get the session from the request cookie
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If the user is not logged in and trying to access a protected route
  if (!session && !isPublicRoute) {
    // Redirect to login page
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirect", encodeURIComponent(pathname))
    return NextResponse.redirect(redirectUrl)
  }

  // If the user is logged in and trying to access a login/register page
  if (session && isPublicRoute) {
    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Check for educator-specific routes
  if (pathname.startsWith("/educator/dashboard") || pathname.startsWith("/educator/courses")) {
    // Get the user profile to check role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session?.user.id).single()

    // If not an educator, redirect to unauthorized page
    if (!profile || profile.role !== "educator") {
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  // Otherwise, continue with the request
  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
