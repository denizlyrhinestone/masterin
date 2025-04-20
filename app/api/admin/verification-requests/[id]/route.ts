import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { logAdminAction } from "@/lib/audit-log"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    // Check if user is an admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get request body
    const body = await request.json()
    const { status, admin_notes } = body

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update verification request
    const { error: updateError } = await supabase
      .from("educator_verification_requests")
      .update({
        status,
        admin_notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)

    if (updateError) {
      console.error("Error updating verification request:", updateError)
      return NextResponse.json({ error: "Failed to update verification request" }, { status: 500 })
    }

    // If approved, update user profile
    if (status === "approved") {
      // First get the user_id from the verification request
      const { data: requestData, error: requestError } = await supabase
        .from("educator_verification_requests")
        .select("user_id")
        .eq("id", params.id)
        .single()

      if (requestError) {
        console.error("Error fetching verification request:", requestError)
        return NextResponse.json({ error: "Failed to fetch verification request" }, { status: 500 })
      }

      // Update user profile
      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          educator_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestData.user_id)

      if (profileUpdateError) {
        console.error("Error updating user profile:", profileUpdateError)
        return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 })
      }
    }

    // Log the admin action
    await logAdminAction({
      actionType: `verification_request_${status}`,
      description: `Verification request ${params.id} ${status === "approved" ? "approved" : "rejected"}`,
      req: request,
    })

    return NextResponse.json({
      success: true,
      message: `Verification request ${status === "approved" ? "approved" : "rejected"} successfully`,
    })
  } catch (error) {
    console.error("Error in verification request API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    // Check if user is an admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get verification request details
    const { data, error } = await supabase
      .from("educator_verification_requests")
      .select(`
       id, 
       institution, 
       credentials, 
       additional_info, 
       status, 
       admin_notes, 
       created_at,
       user_id,
       profiles:user_id (
         id,
         full_name,
         email,
         educator_title,
         educator_bio
       )
     `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching verification request:", error)
      return NextResponse.json({ error: "Failed to fetch verification request" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in verification request API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
