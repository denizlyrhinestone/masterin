import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function logAdminAction({
  actionType,
  description,
  req,
}: {
  actionType: string
  description: string
  req: Request
}) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const userId = session?.user?.id
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("remote-addr") || ""
    const userAgent = req.headers.get("user-agent") || ""

    const { error } = await supabase.from("admin_audit_logs").insert({
      user_id: userId,
      action_type: actionType,
      description: description,
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    if (error) {
      console.error("Error logging admin action:", error)
    }
  } catch (error) {
    console.error("Error in logAdminAction:", error)
  }
}
