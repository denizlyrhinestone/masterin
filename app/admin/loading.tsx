import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoading() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-10 w-48" />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-8 w-40" />
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-8 w-40" />
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  )
}
