import { getPopularCourses } from "@/lib/course-views"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

// This would typically come from a database
const coursesData = {
  "web-development": {
    id: "web-development",
    title: "Full-Stack Web Development",
    instructor: "Sarah Johnson",
    imageUrl: "/images/classes/web-development.jpg",
  },
  "machine-learning": {
    id: "machine-learning",
    title: "Machine Learning Fundamentals",
    instructor: "Dr. Michael Chen",
    imageUrl: "/images/classes/machine-learning.jpg",
  },
  "ui-design": {
    id: "ui-design",
    title: "UI/UX Design Principles",
    instructor: "Emma Rodriguez",
    imageUrl: "/images/classes/ui-design.jpg",
  },
  "python-programming": {
    id: "python-programming",
    title: "Python for Data Analysis",
    instructor: "James Wilson",
    imageUrl: "/images/classes/python-programming.jpg",
  },
  "javascript-basics": {
    id: "javascript-basics",
    title: "JavaScript Fundamentals",
    instructor: "Alex Thompson",
    imageUrl: "/images/classes/javascript-basics.jpg",
  },
  "data-visualization": {
    id: "data-visualization",
    title: "Data Visualization with D3.js",
    instructor: "Lisa Wang",
    imageUrl: "/images/classes/data-visualization.jpg",
  },
}

export async function PopularCourses() {
  // Wrap in try-catch to handle any errors
  let popularCourseIds: string[] = []

  try {
    popularCourseIds = await getPopularCourses(4)
  } catch (error) {
    console.error("Error fetching popular courses:", error)
    // If there's an error, we'll fall back to default courses below
  }

  // If no popular courses yet, show some default courses
  const coursesToShow =
    popularCourseIds.length > 0
      ? popularCourseIds.map((id) => coursesData[id as keyof typeof coursesData]).filter(Boolean)
      : Object.values(coursesData).slice(0, 4)

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6">Popular Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {coursesToShow.map((course) => (
          <Link key={course.id} href={`/classes/${course.id}`}>
            <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
              <div className="relative h-40 w-full">
                <Image
                  src={course.imageUrl || "/placeholder.svg"}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">{course.title}</h3>
                <p className="text-sm text-gray-500">Instructor: {course.instructor}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
