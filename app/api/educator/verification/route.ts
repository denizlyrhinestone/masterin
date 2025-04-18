import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
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

    // Get the request body
    const body = await request.json()
    const { institution, credentials, additionalInfo } = body

    if (!institution || !credentials) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user is an educator
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError || profile?.role !== "educator") {
      return NextResponse.json({ error: "User is not registered as an educator" }, { status: 403 })
    }

    // Create verification request
    const { data, error } = await supabase
      .from("educator_verification_requests")
      .insert({
        user_id: session.user.id,
        institution,
        credentials,
        additional_info: additionalInfo,
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("Error creating verification request:", error)
      return NextResponse.json({ error: "Failed to create verification request" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Verification request submitted successfully",
      requestId: data[0].id,
    })
  } catch (error) {
    console.error("Error in verification route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
