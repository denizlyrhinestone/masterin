import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VerificationRequestActions } from "@/components/admin/verification-request-actions"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function VerificationRequestPage({ params }) {
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

  // Get the verification request
  const { data: request, error } = await supabase
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

  if (error || !request) {
    notFound()
  }

  return (
    <div>
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/verification-requests">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Verification Requests
          </Link>
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-6">Verification Request Details</h1>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{request.profiles?.full_name || request.profiles?.email}</CardTitle>
              <CardDescription>
                Submitted {new Date(request.created_at).toLocaleDateString()} at{" "}
                {new Date(request.created_at).toLocaleTimeString()}
              </CardDescription>
            </div>
            <Badge
              variant={
                request.status === "approved" ? "default" : request.status === "rejected" ? "destructive" : "outline"
              }
              className="capitalize"
            >
              {request.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Applicant Information</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p>{request.profiles?.full_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{request.profiles?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Professional Title</p>
                  <p>{request.profiles?.educator_title || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bio</p>
                  <p className="text-sm whitespace-pre-wrap">{request.profiles?.educator_bio || "N/A"}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Verification Information</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Institution</p>
                  <p>{request.institution}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Credentials</p>
                  <p className="text-sm whitespace-pre-wrap">{request.credentials}</p>
                </div>
                {request.additional_info && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Additional Information</p>
                    <p className="text-sm whitespace-pre-wrap">{request.additional_info}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {request.status !== "pending" && request.admin_notes && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Admin Notes</h3>
              <div className="p-4 bg-muted rounded-md whitespace-pre-wrap">{request.admin_notes}</div>
            </div>
          )}

          {request.status === "pending" && (
            <div className="mt-6">
              <VerificationRequestActions request={request} />
            </div>
          )}
        </CardContent>
        {request.status !== "pending" && (
          <CardFooter>
            <Button asChild>
              <Link href="/admin/verification-requests">Back to All Requests</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
