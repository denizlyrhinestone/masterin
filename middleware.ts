import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Only apply to admin routes
  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    const adminKey = request.headers.get("x-admin-key")

    // Check if the admin key is valid
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/admin/:path*"],
}
