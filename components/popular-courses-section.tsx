import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Users, Clock } from "lucide-react"

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
    imageUrl:
      "/placeholder.svg?height=200&width=400&query=artificial intelligence course thumbnail with digital brain visualization",
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
    imageUrl: "/placeholder.svg?height=200&width=400&query=mathematics calculus formulas on chalkboard",
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
    imageUrl: "/placeholder.svg?height=200&width=400&query=creative writing notebook with pen and coffee",
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
    imageUrl: "/placeholder.svg?height=200&width=400&query=ancient civilization ruins with columns and architecture",
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
                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Link href={`/courses/${course.id}`}>Enroll Now</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
