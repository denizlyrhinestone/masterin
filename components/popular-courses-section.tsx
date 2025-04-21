import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Users, Clock, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const popularCourses = [
  {
    id: 1,
    title: "Introduction to Artificial Intelligence",
    description: "Learn the fundamentals of AI, machine learning, and neural networks.",
    category: "Computer Science",
    level: "Beginner",
    rating: 4.8,
    students: 1245,
    duration: "8 weeks",
    instructor: "Dr. Sarah Chen",
    imageUrl: "/digital-brain-ai.png",
    isAIEnabled: true,
  },
  {
    id: 2,
    title: "Advanced Calculus",
    description: "Master derivatives, integrals, and applications of calculus in real-world scenarios.",
    category: "Mathematics",
    level: "Advanced",
    rating: 4.7,
    students: 876,
    duration: "10 weeks",
    instructor: "Prof. Michael Johnson",
    imageUrl: "/calculus-chalkboard.png",
  },
  {
    id: 3,
    title: "Creative Writing Workshop",
    description: "Develop your storytelling skills and learn techniques from published authors.",
    category: "Language Arts",
    level: "Intermediate",
    rating: 4.9,
    students: 1032,
    duration: "6 weeks",
    instructor: "Emma Rodriguez",
    imageUrl: "/creative-workspace.png",
  },
  {
    id: 4,
    title: "World History: Ancient Civilizations",
    description: "Explore the rise and fall of ancient civilizations and their lasting impact.",
    category: "Social Studies",
    level: "Beginner",
    rating: 4.6,
    students: 945,
    duration: "12 weeks",
    instructor: "Dr. James Wilson",
    imageUrl: "/sun-kissed-colonnade.png",
  },
]

export function PopularCoursesSection() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Popular Courses</h2>
            <p className="text-lg text-gray-600">Discover our most sought-after courses and start learning today</p>
          </div>
          <Button asChild variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
            <Link href="/courses">View All Courses</Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {popularCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden transition-all hover:shadow-md">
              <div className="aspect-video relative">
                <Image src={course.imageUrl || "/placeholder.svg"} alt={course.title} fill className="object-cover" />
                {course.isAIEnabled && (
                  <div className="absolute top-2 right-2 rounded-full bg-emerald-600 px-2 py-1 text-xs font-medium text-white shadow-sm">
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>AI Tutor</span>
                    </div>
                  </div>
                )}
              </div>
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                    {course.category}
                  </Badge>
                  <Badge variant="outline" className="bg-slate-50 text-slate-700">
                    {course.level}
                  </Badge>
                </div>
                <Link href={`/courses/${course.id}`} className="hover:underline">
                  <h3 className="mt-2 line-clamp-2 text-xl font-semibold">{course.title}</h3>
                </Link>
                <p className="line-clamp-2 text-sm text-gray-600">{course.description}</p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="flex items-center">
                    <Star className="mr-1 h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="mr-2 font-medium">{course.rating}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-1 h-4 w-4 text-gray-400" />
                    <span className="mr-2">{course.students} students</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-gray-400" />
                    <span>{course.duration}</span>
                  </div>
                </div>
                <div className="mt-2 text-sm">Instructor: {course.instructor}</div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button
                  asChild
                  className={cn(
                    "w-full transition-all duration-200",
                    course.isAIEnabled
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:shadow-md"
                      : "bg-emerald-600 hover:bg-emerald-700",
                  )}
                >
                  <Link href={course.isAIEnabled ? `/ai-tutor?course=${course.id}` : `/courses/${course.id}`}>
                    {course.isAIEnabled ? "Start with AI Tutor" : "Enroll Now"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
