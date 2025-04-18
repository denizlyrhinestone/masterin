import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCheck, Users, BookOpen, AlertTriangle, Settings } from "lucide-react"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function AdminDashboard() {
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

  // Get counts for dashboard
  const { count: pendingVerificationCount } = await supabase
    .from("educator_verification_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { count: totalUsersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: educatorCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "educator")

  const { count: studentCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "student")

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Verifications</p>
                <p className="text-3xl font-bold">{pendingVerificationCount || 0}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{totalUsersCount || 0}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Educators</p>
                <p className="text-3xl font-bold">{educatorCount || 0}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Students</p>
                <p className="text-3xl font-bold">{studentCount || 0}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {pendingVerificationCount > 0 && (
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-amber-800">Pending Verification Requests</CardTitle>
            </div>
            <CardDescription className="text-amber-700">
              There are {pendingVerificationCount} educator verification requests awaiting your review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/verification-requests">Review Requests</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Recently registered users on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentUsersList supabase={supabase} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button asChild variant="outline" className="h-auto py-4 justify-start items-start flex-col text-left">
              <Link href="/admin/verification-requests">
                <UserCheck className="h-5 w-5 mb-2" />
                <div>
                  <div className="font-medium">Verification Requests</div>
                  <div className="text-xs text-muted-foreground mt-1">Review educator verification requests</div>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto py-4 justify-start items-start flex-col text-left">
              <Link href="/admin/users">
                <Users className="h-5 w-5 mb-2" />
                <div>
                  <div className="font-medium">Manage Users</div>
                  <div className="text-xs text-muted-foreground mt-1">View and manage user accounts</div>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto py-4 justify-start items-start flex-col text-left">
              <Link href="/admin/courses">
                <BookOpen className="h-5 w-5 mb-2" />
                <div>
                  <div className="font-medium">Manage Courses</div>
                  <div className="text-xs text-muted-foreground mt-1">Review and manage courses</div>
                </div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto py-4 justify-start items-start flex-col text-left">
              <Link href="/admin/settings">
                <Settings className="h-5 w-5 mb-2" />
                <div>
                  <div className="font-medium">Platform Settings</div>
                  <div className="text-xs text-muted-foreground mt-1">Configure platform settings</div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

async function RecentUsersList({ supabase }) {
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false })
    .limit(5)

  if (!recentUsers || recentUsers.length === 0) {
    return <p className="text-muted-foreground text-sm">No recent users found.</p>
  }

  return (
    <div className="space-y-4">
      {recentUsers.map((user) => (
        <div key={user.id} className="flex items-center justify-between border-b pb-2">
          <div>
            <p className="font-medium">{user.full_name || user.email}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Badge variant={user.role === "admin" ? "default" : user.role === "educator" ? "secondary" : "outline"}>
            {user.role}
          </Badge>
        </div>
      ))}
    </div>
  )
}
