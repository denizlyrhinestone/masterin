import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface CourseProgressData {
  courseId: string
  courseTitle: string
  progress: number
  completedLessons: number
  totalLessons: number
}

interface CourseProgressProps {
  progressData: CourseProgressData[]
}

export default function CourseProgress({ progressData }: CourseProgressProps) {
  if (progressData.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {progressData.map((course) => (
            <div key={course.courseId} className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{course.courseTitle}</h3>
                <span className="text-sm text-muted-foreground">
                  {course.completedLessons}/{course.totalLessons} lessons
                </span>
              </div>
              <Progress value={course.progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-right">{course.progress}% complete</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
