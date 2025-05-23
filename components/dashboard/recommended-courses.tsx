import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

interface RecommendedCourse {
  id: string
  slug: string
  title: string
  description: string
  imageUrl: string
  rating: number
  instructor: string
}

interface RecommendedCoursesProps {
  courses: RecommendedCourse[]
}

export default function RecommendedCourses({ courses }: RecommendedCoursesProps) {
  if (courses.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended For You</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
              <div className="w-24 h-16 rounded-md overflow-hidden flex-shrink-0">
                <img
                  src={course.imageUrl || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{course.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{course.instructor}</p>
                <div className="flex items-center mt-1">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(course.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground ml-1">{course.rating.toFixed(1)}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild className="flex-shrink-0">
                <Link href={`/courses/${course.slug}`}>View</Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
