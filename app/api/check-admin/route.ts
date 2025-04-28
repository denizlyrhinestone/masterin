import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { isAdminEmail } from "@/lib/admin-utils"

export async function POST() {
  try {
    // Get the current session server-side
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ isAdmin: false }, { status: 401 })
    }

    // Check if the user's email matches the admin email
    const { isAdmin } = isAdminEmail(session.user.email)

    return NextResponse.json({ isAdmin })
  } catch (error) {
    console.error("Error checking admin status:", error)
    return NextResponse.json({ isAdmin: false }, { status: 500 })
  }
}
