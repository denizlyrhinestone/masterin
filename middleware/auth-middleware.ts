import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function authMiddleware(request: NextRequest) {
  // Create a Supabase client for auth checks
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Get the authorization header
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Extract the token
  const token = authHeader.split(" ")[1]

  try {
    // Verify the token
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Add the user to the request for downstream handlers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", data.user.id)
    requestHeaders.set("x-user-email", data.user.email || "")
    requestHeaders.set("x-user-role", data.user.role || "user")

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error("Auth middleware error:", error)
    return NextResponse.json({ error: "Authentication error" }, { status: 500 })
  }
}
