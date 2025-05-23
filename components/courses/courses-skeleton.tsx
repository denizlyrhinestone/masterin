export default function CoursesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-[320px] rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
      ))}
    </div>
  )
}
