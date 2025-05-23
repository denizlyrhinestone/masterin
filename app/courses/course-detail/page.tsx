import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Course Details - Masterin",
  description: "View course details and enroll in our courses.",
}

export default function CourseDetailPage() {
  return (
    <div className="container mx-auto px-4 py-12 mt-16">
      <div className="mb-6">
        <Link href="/courses">
          <Button variant="ghost" size="sm">
            ← Back to Courses
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-4">Sample Course</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            This is a placeholder for course details. Our course system is currently being updated.
          </p>

          <div className="mt-8">
            <Button disabled>Enroll (Coming Soon)</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
