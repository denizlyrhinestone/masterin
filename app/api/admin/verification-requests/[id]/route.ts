import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { logAdminAction } from "@/lib/audit-log"
import { sendVerificationStatusEmail } from "@/lib/email-utils"

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

    // Get the verification request to access user information
    const { data: requestData, error: requestError } = await supabase
      .from("educator_verification_requests")
      .select("user_id")
      .eq("id", params.id)
      .single()

    if (requestError) {
      console.error("Error fetching verification request:", requestError)
      return NextResponse.json({ error: "Failed to fetch verification request" }, { status: 500 })
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

    // Get user email for notification
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", requestData.user_id)
      .single()

    if (!userError && userData?.email) {
      // Send email notification
      await sendVerificationStatusEmail(
        userData.email,
        status as "approved" | "rejected",
        status === "rejected" ? admin_notes : undefined,
      )

      // Create in-app notification
      await supabase.from("notifications").insert({
        user_id: requestData.user_id,
        type: `verification_${status}`,
        title: status === "approved" ? "Verification Approved" : "Verification Rejected",
        message:
          status === "approved"
            ? "Your educator verification request has been approved."
            : "Your educator verification request has been rejected.",
        read: false,
      })
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
