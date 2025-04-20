import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-10 w-48" />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Analytics Loading */}
        <div className="rounded-lg border p-4">
          <Skeleton className="h-8 w-40 mb-4" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>

        {/* Recent Users Loading */}
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
      </div>

      {/* Audit Logs Loading */}
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
    </div>
  )
}
