import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Define the featured classes with images
const featuredClasses = [
  {
    id: "web-development",
    title: "Full-Stack Web Development",
    instructor: "Sarah Johnson",
    category: "Programming",
    level: "Intermediate",
    duration: "12 weeks",
    rating: 4.8,
    students: 1245,
    imageUrl: "/images/classes/web-development.jpg",
  },
  {
    id: "machine-learning",
    title: "Machine Learning Fundamentals",
    instructor: "Dr. Michael Chen",
    category: "Data Science",
    level: "Advanced",
    duration: "10 weeks",
    rating: 4.9,
    students: 987,
    imageUrl: "/images/classes/machine-learning.jpg",
  },
  {
    id: "ui-design",
    title: "UI/UX Design Principles",
    instructor: "Emma Rodriguez",
    category: "Design",
    level: "Beginner",
    duration: "8 weeks",
    rating: 4.7,
    students: 1532,
    imageUrl: "/images/classes/ui-design.jpg",
  },
  {
    id: "python-programming",
    title: "Python for Data Analysis",
    instructor: "James Wilson",
    category: "Programming",
    level: "Intermediate",
    duration: "6 weeks",
    rating: 4.6,
    students: 2156,
    imageUrl: "/images/classes/python-programming.jpg",
  },
]

export function FeaturedClasses() {
  return (
    <section>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Featured Classes</h2>
        <Link href="/classes" className="text-blue-600 hover:underline">
          View all classes →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredClasses.map((course) => (
          <Card key={course.id} className="overflow-hidden h-full flex flex-col">
            <div className="relative h-48 w-full">
              <Image
                src={course.imageUrl || "/placeholder.svg"}
                alt={course.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </div>
            <CardContent className="p-4 flex-grow">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {course.category}
                </Badge>
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                  {course.level}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
              <p className="text-sm text-gray-500 mb-2">Instructor: {course.instructor}</p>
              <div className="flex items-center text-sm text-gray-500">
                <span className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  {course.rating}
                </span>
                <span className="mx-2">•</span>
                <span>{course.students.toLocaleString()} students</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 mt-auto">
              <div className="w-full flex justify-between items-center">
                <span className="text-sm text-gray-500">{course.duration}</span>
                <Link href={`/classes/${course.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                  View details →
                </Link>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}
