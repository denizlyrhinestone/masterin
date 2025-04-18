import { CourseCreationForm } from "@/components/course-creation-form"
import { MasterinSidebar } from "@/components/masterin-sidebar"

export default function CreateCoursePage() {
  return (
    <div className="flex min-h-screen">
      <MasterinSidebar />
      <div className="flex-1">
        <CourseCreationForm />
      </div>
    </div>
  )
}
