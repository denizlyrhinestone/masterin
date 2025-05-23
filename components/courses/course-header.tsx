"use client"
import { Button } from "@/components/ui/button"
import { Share2, BookOpen } from "lucide-react"

interface CourseHeaderProps {
  title: string
  subtitle?: string
  imageUrl: string
  instructor: string
  category: string
  level: string
  enrollmentCount: number
  isEnrolled?: boolean
  onEnroll?: () => void
}

export default function CourseHeader({
  title,
  subtitle,
  imageUrl,
  instructor,
  category,
  level,
  enrollmentCount,
  isEnrolled = false,
  onEnroll,
}: CourseHeaderProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-10" />
      <div className="h-64 w-full bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} />
      <div className="container relative z-20 -mt-24 pb-8">
        <div className="bg-card rounded-lg shadow-lg p-6 border">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <span>{category}</span>
                <span>•</span>
                <span>{level}</span>
              </div>
              <h1 className="text-3xl font-bold">{title}</h1>
              {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-sm">{enrollmentCount} students enrolled</span>
                </div>
                <div className="text-sm">
                  Instructor: <span className="font-medium">{instructor}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 self-start">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {!isEnrolled && onEnroll && <Button onClick={onEnroll}>Enroll Now</Button>}
              {isEnrolled && <Button variant="secondary">Continue Learning</Button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
