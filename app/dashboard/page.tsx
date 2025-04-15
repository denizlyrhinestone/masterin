"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { user, status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if user is not authenticated
    if (status === "unauthenticated") {
      router.push("/auth?action=login")
    }
  }, [status, router])

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="container mx-auto py-10">
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  // If user is not authenticated, don't render anything (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user.user_metadata?.name || user.email}</CardTitle>
            <CardDescription>You've successfully signed in to LearnWise</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Your account is now active and you can access all the features of the platform.</p>
            <div className="flex space-x-4">
              <Button asChild>
                <a href="/courses">Browse Courses</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/profile">View Profile</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Email: </span>
                <span>{user.email}</span>
              </div>
              <div>
                <span className="font-medium">Email verified: </span>
                <span>{user.email_confirmed_at ? "Yes" : "No"}</span>
              </div>
              <div>
                <span className="font-medium">Auth provider: </span>
                <span>{user.app_metadata?.provider || "Email"}</span>
              </div>
              {!user.email_confirmed_at && (
                <div className="mt-4">
                  <Button variant="outline" asChild>
                    <a href="/auth/verify">Verify Email</a>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
