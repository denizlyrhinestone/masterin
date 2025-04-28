export default function Loading() {
  return (
    <div className="container mx-auto py-10">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6 animate-pulse"></div>

      <div className="grid gap-6">
        <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-sm">
          <div className="p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-6 animate-pulse"></div>

            <div className="space-y-4">
              <div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/6 mb-1 animate-pulse"></div>
                <div className="h-[100px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse"></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-sm">
          <div className="p-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-6 animate-pulse"></div>

            <div className="flex items-center justify-between">
              <div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
