import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Get the current session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get the user profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role, educator_verified")
      .eq("id", session.user.id)
      .single()

    if (error) {
      console.error("Error fetching profile:", error)
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    // Check if the user is an educator
    const isEducator = profile?.role === "educator"
    const isVerified = profile?.educator_verified === true

    return NextResponse.json({
      isEducator,
      isVerified,
    })
  } catch (error) {
    console.error("Error in check-educator route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
