import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { VerificationAppealForm } from "@/components/educator/verification-appeal-form"

export default async function VerificationAppealPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerComponentClient({ cookies })

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  // Get verification request
  const { data: request, error } = await supabase
    .from("educator_verification_requests")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", session.user.id)
    .single()

  // If request doesn't exist or doesn't belong to user, redirect
  if (error || !request) {
    redirect("/dashboard")
  }

  // If request is not rejected, redirect
  if (request.status !== "rejected") {
    redirect("/dashboard")
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Appeal Verification Decision</h1>
        <VerificationAppealForm requestId={params.id} previousReason={request.admin_notes} />
      </div>
    </div>
  )
}
