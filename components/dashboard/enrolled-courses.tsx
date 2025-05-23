import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface EnrolledCourse {
  id: string
  slug: string
  title: string
  imageUrl: string
  progress: number
  lastAccessed: string
  nextLessonSlug?: string
}

interface EnrolledCoursesProps {
  courses: EnrolledCourse[]
}

export default function EnrolledCourses({ courses }: EnrolledCoursesProps) {
  if (courses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet</p>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Courses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col md:flex-row gap-4 items-start border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="w-full md:w-24 h-16 rounded-md overflow-hidden flex-shrink-0">
                <img
                  src={course.imageUrl || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{course.title}</h3>
                <p className="text-sm text-muted-foreground">Last accessed: {course.lastAccessed}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={course.progress} className="h-2" />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{course.progress}%</span>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild className="mt-2 md:mt-0">
                <Link
                  href={
                    course.nextLessonSlug
                      ? `/courses/${course.slug}/lessons/${course.nextLessonSlug}`
                      : `/courses/${course.slug}`
                  }
                >
                  Continue <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
