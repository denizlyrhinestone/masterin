import { Progress } from "@/components/ui/progress"

interface LessonProgressProps {
  currentLessonIndex: number
  totalLessons: number
  percentComplete: number
}

export default function LessonProgress({ currentLessonIndex, totalLessons, percentComplete }: LessonProgressProps) {
  return (
    <div className="space-y-2 mb-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Lesson {currentLessonIndex + 1} of {totalLessons}
        </span>
        <span className="text-sm font-medium">{percentComplete}% Complete</span>
      </div>
      <Progress value={percentComplete} className="h-2" />
    </div>
  )
}
