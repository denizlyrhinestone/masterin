import { Suspense } from "react"
import { RecentUsersList } from "@/components/admin/users-list"
import { VerificationAnalytics } from "@/components/admin/verification-analytics"
import { AdminAuditLogs } from "@/components/admin/audit-logs"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense
          fallback={
            <div className="rounded-lg border p-4">
              <Skeleton className="h-8 w-40 mb-4" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          }
        >
          <VerificationAnalytics />
        </Suspense>

        <Suspense
          fallback={
            <div className="rounded-lg border p-4">
              <Skeleton className="h-8 w-40 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          }
        >
          <RecentUsersList />
        </Suspense>
      </div>

      <Suspense
        fallback={
          <div className="rounded-lg border p-4">
            <Skeleton className="h-8 w-40 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        }
      >
        <AdminAuditLogs />
      </Suspense>
    </div>
  )
}
