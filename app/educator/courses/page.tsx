import { EducatorCourseDashboard } from "@/components/educator-course-dashboard"
import { MasterinSidebar } from "@/components/masterin-sidebar"

export default function EducatorCoursesPage() {
  return (
    <div className="flex min-h-screen">
      <MasterinSidebar />
      <div className="flex-1">
        <EducatorCourseDashboard />
      </div>
    </div>
  )
}
