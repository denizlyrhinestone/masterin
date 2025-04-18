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
        <img src={image || "/placeholder.svg"} alt={title} className="h-36 md:h-48 w-full object-cover" />
        {isAP && <Badge className="absolute right-2 top-2 bg-primary text-white text-xs">AP Course</Badge>}
      </div>
      <div className="p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-bold line-clamp-1">{title}</h3>
        <p className="mb-3 md:mb-4 mt-1 text-xs md:text-sm text-muted-foreground line-clamp-2">{description}</p>

        <div className="mb-1 flex justify-between text-xs md:text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{progress}% Complete</span>
        </div>
        <Progress value={progress} className="h-2 mb-3 md:mb-4" />

        <Button size="sm" className="w-full md:size-md" asChild>
          <Link href={`/courses/${id}/learn`}>Continue</Link>
        </Button>
      </div>
    </div>
  )
}
