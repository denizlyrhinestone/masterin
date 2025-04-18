import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { VerificationRequestsList } from "@/components/admin/verification-requests-list"

export default async function VerificationRequestsPage({ searchParams }) {
  // Get the status filter from the URL or default to "pending"
  const statusFilter = searchParams?.status || "pending"

  // Initialize Supabase client
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options })
        },
      },
    },
  )

  // Get counts for each status
  const { count: pendingCount } = await supabase
    .from("educator_verification_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { count: approvedCount } = await supabase
    .from("educator_verification_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved")

  const { count: rejectedCount } = await supabase
    .from("educator_verification_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "rejected")

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Educator Verification Requests</h1>

      <Card>
        <CardHeader>
          <CardTitle>Manage Verification Requests</CardTitle>
          <CardDescription>Review and process educator verification requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={statusFilter} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" asChild>
                <a href="/admin/verification-requests?status=pending">Pending ({pendingCount || 0})</a>
              </TabsTrigger>
              <TabsTrigger value="approved" asChild>
                <a href="/admin/verification-requests?status=approved">Approved ({approvedCount || 0})</a>
              </TabsTrigger>
              <TabsTrigger value="rejected" asChild>
                <a href="/admin/verification-requests?status=rejected">Rejected ({rejectedCount || 0})</a>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="mt-6">
              <VerificationRequestsList status={statusFilter} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
