import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface CourseCardProps {
  id: string
  title: string
  description: string
  progress: number
  image: string
  isAP?: boolean
}

export function CourseCard({ id, title, description, progress, image, isAP }: CourseCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="relative">
        <img src={image || "/placeholder.svg"} alt={title} className="h-48 w-full object-cover" />
        {isAP && <Badge className="absolute right-2 top-2 bg-primary text-white">AP Course</Badge>}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">{description}</p>

        <div className="mb-1 flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{progress}% Complete</span>
        </div>
        <Progress value={progress} className="h-2 mb-4" />

        <Button asChild className="w-full">
          <Link href={`/courses/${id}/learn`}>Continue</Link>
        </Button>
      </div>
    </div>
  )
}
