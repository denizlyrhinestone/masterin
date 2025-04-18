import { CourseCatalog } from "@/components/course-catalog"
import { MasterinSidebar } from "@/components/masterin-sidebar"

export default function ExplorePage() {
  return (
    <div className="flex min-h-screen">
      <MasterinSidebar />
      <div className="flex-1">
        <CourseCatalog />
      </div>
    </div>
  )
}
