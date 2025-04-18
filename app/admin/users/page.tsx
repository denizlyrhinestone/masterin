import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersList } from "@/components/admin/users-list"

export default async function UsersPage({ searchParams }) {
  // Get the role filter from the URL or default to "all"
  const roleFilter = searchParams?.role || "all"

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

  // Get counts for each role
  const { count: totalCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: studentCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "student")

  const { count: educatorCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "educator")

  const { count: adminCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin")

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
          <CardDescription>View and manage user accounts on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            <a
              href="/admin/users?role=all"
              className={`px-3 py-1 rounded-full text-sm ${
                roleFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
            >
              All Users ({totalCount || 0})
            </a>
            <a
              href="/admin/users?role=student"
              className={`px-3 py-1 rounded-full text-sm ${
                roleFilter === "student" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
            >
              Students ({studentCount || 0})
            </a>
            <a
              href="/admin/users?role=educator"
              className={`px-3 py-1 rounded-full text-sm ${
                roleFilter === "educator" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
            >
              Educators ({educatorCount || 0})
            </a>
            <a
              href="/admin/users?role=admin"
              className={`px-3 py-1 rounded-full text-sm ${
                roleFilter === "admin" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
              }`}
            >
              Admins ({adminCount || 0})
            </a>
          </div>

          <UsersList roleFilter={roleFilter} />
        </CardContent>
      </Card>
    </div>
  )
}
