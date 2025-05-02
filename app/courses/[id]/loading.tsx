import { Skeleton } from "@/components/ui/skeleton"

export default function CourseDetailLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Skeleton className="h-6 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-full mb-4" />
            <Skeleton className="h-6 w-2/3 mb-6" />

            <Skeleton className="aspect-video w-full rounded-md mb-6" />
          </div>

          <div>
            <Skeleton className="h-10 w-full mb-6" />

            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Skeleton className="h-[500px] w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}
