import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyStackSession } from "@/lib/stack-client"

// List of paths that require authentication
const protectedPaths = ["/dashboard", "/profile", "/my-courses"]

// List of paths that are accessible only to non-authenticated users
const authPaths = ["/login", "/signup"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path))

  // Get the session token from the cookies
  const sessionToken = request.cookies.get("stack_session_token")?.value

  // Verify the session if there's a token
  const isAuthenticated = sessionToken ? await verifyStackSession(sessionToken) : false

  // Redirect if needed
  if (isProtectedPath && !isAuthenticated) {
    // Redirect to login if trying to access protected path without authentication
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuthPath && isAuthenticated) {
    // Redirect to dashboard if trying to access auth paths while authenticated
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Specify which paths the middleware should run on
  matcher: [
    // Protected paths
    "/dashboard/:path*",
    "/profile/:path*",
    "/my-courses/:path*",
    // Auth paths
    "/login",
    "/signup",
  ],
}
