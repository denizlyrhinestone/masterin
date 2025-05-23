import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Award, ArrowRight } from "lucide-react"
import Link from "next/link"

interface DashboardHeaderProps {
  userName: string
  enrolledCourses: number
  completedCourses: number
  totalHoursLearned: number
  nextLesson?: {
    title: string
    courseTitle: string
    href: string
  }
}

export default function DashboardHeader({
  userName,
  enrolledCourses,
  completedCourses,
  totalHoursLearned,
  nextLesson,
}: DashboardHeaderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userName}!</h1>
        <p className="text-muted-foreground mt-1">Track your progress and continue your learning journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                <p className="text-2xl font-bold">{enrolledCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hours Learned</p>
                <p className="text-2xl font-bold">{totalHoursLearned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {nextLesson && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Continue Learning</p>
                <h3 className="font-medium">{nextLesson.title}</h3>
                <p className="text-sm text-muted-foreground">{nextLesson.courseTitle}</p>
              </div>
              <Button asChild>
                <Link href={nextLesson.href}>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
