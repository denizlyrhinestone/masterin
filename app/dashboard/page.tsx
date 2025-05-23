import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getUserEnrollments } from "@/lib/course-service"
import DashboardHeader from "@/components/dashboard/dashboard-header"
import EnrolledCourses from "@/components/dashboard/enrolled-courses"
import CourseProgress from "@/components/dashboard/course-progress"
import RecommendedCourses from "@/components/dashboard/recommended-courses"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your personal learning dashboard",
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/sign-in?callbackUrl=/dashboard")
  }

  const enrollments = await getUserEnrollments(session.user.id)

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <DashboardHeader user={session.user} />

      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <EnrolledCourses enrollments={enrollments} />

            <CourseProgress enrollments={enrollments} />
          </div>

          <div className="lg:col-span-1 space-y-8">
            <RecommendedCourses userId={session.user.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
