import { BookOpen, Clock, Star, Award } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { CourseCard } from "@/components/dashboard/course-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  // In a real app, this data would come from an API or database
  const stats = {
    enrolledCourses: 5,
    learningTime: 12.5,
    completedLessons: 15,
    averageScore: 85,
  }

  const inProgressCourses = [
    {
      id: "ap-biology",
      title: "AP Biology",
      description: "Cellular processes, genetics, evolution, and biological systems.",
      progress: 85,
      image: "/diverse-cell-landscape.png",
      isAP: true,
    },
    {
      id: "chemistry",
      title: "Chemistry",
      description: "Atomic structure, chemical bonding, and reactions.",
      progress: 42,
      image: "/busy-chemistry-lab.png",
      isAP: false,
    },
    {
      id: "environmental-science",
      title: "Environmental Science",
      description: "Ecosystems, biodiversity, and environmental challenges.",
      progress: 78,
      image: "/golden-marsh-twilight.png",
      isAP: false,
    },
  ]

  return (
    <div className="container mx-auto p-6">
      {/* Welcome Banner */}
      <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
        <h1 className="text-3xl font-bold">
          Welcome to <span className="text-primary">Masterin</span>
        </h1>
        <p className="mb-6 text-muted-foreground">Your personalized learning journey starts here.</p>
        <div className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/my-courses">Continue Learning</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/categories">Explore Categories</Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={<BookOpen className="h-6 w-6" />}
          value={stats.enrolledCourses}
          label="Enrolled Courses"
          iconColor="text-blue-500"
        />
        <StatsCard
          icon={<Clock className="h-6 w-6" />}
          value={`${stats.learningTime} hrs`}
          label="Learning Time"
          iconColor="text-purple-500"
        />
        <StatsCard
          icon={<Star className="h-6 w-6" />}
          value={stats.completedLessons}
          label="Completed Lessons"
          iconColor="text-teal-500"
        />
        <StatsCard
          icon={<Award className="h-6 w-6" />}
          value={`${stats.averageScore}%`}
          label="Average Score"
          iconColor="text-amber-500"
        />
      </div>

      {/* Continue Learning Section */}
      <h2 className="mb-6 text-2xl font-bold">Continue Learning</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {inProgressCourses.map((course) => (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.title}
            description={course.description}
            progress={course.progress}
            image={course.image}
            isAP={course.isAP}
          />
        ))}
      </div>
    </div>
  )
}
