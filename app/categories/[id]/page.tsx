import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// This would typically come from a database
const categories = {
  programming: {
    id: "programming",
    title: "Programming",
    description: "Learn coding, web development, and software engineering",
    imageUrl: "/images/categories/programming.jpg",
    color: "bg-blue-500",
    classes: [
      {
        id: "web-development",
        title: "Full-Stack Web Development",
        instructor: "Sarah Johnson",
        level: "Intermediate",
        imageUrl: "/images/classes/web-development.jpg",
      },
      {
        id: "python-programming",
        title: "Python for Data Analysis",
        instructor: "James Wilson",
        level: "Intermediate",
        imageUrl: "/images/classes/python-programming.jpg",
      },
      {
        id: "javascript-basics",
        title: "JavaScript Fundamentals",
        instructor: "Alex Thompson",
        level: "Beginner",
        imageUrl: "/images/classes/javascript-basics.jpg",
      },
    ],
  },
  "data-science": {
    id: "data-science",
    title: "Data Science",
    description: "Master data analysis, machine learning, and AI concepts",
    imageUrl: "/images/categories/data-science.jpg",
    color: "bg-purple-500",
    classes: [
      {
        id: "machine-learning",
        title: "Machine Learning Fundamentals",
        instructor: "Dr. Michael Chen",
        level: "Advanced",
        imageUrl: "/images/classes/machine-learning.jpg",
      },
      {
        id: "data-visualization",
        title: "Data Visualization with D3.js",
        instructor: "Lisa Wang",
        level: "Intermediate",
        imageUrl: "/images/classes/data-visualization.jpg",
      },
    ],
  },
  design: {
    id: "design",
    title: "Design",
    description: "Explore UI/UX, graphic design, and creative tools",
    imageUrl: "/images/categories/design.jpg",
    color: "bg-pink-500",
    classes: [
      {
        id: "ui-design",
        title: "UI/UX Design Principles",
        instructor: "Emma Rodriguez",
        level: "Beginner",
        imageUrl: "/images/classes/ui-design.jpg",
      },
    ],
  },
  business: {
    id: "business",
    title: "Business",
    description: "Develop entrepreneurship and management skills",
    imageUrl: "/images/categories/business.jpg",
    color: "bg-green-500",
    classes: [],
  },
  languages: {
    id: "languages",
    title: "Languages",
    description: "Learn new languages with interactive lessons",
    imageUrl: "/images/categories/languages.jpg",
    color: "bg-yellow-500",
    classes: [],
  },
  mathematics: {
    id: "mathematics",
    title: "Mathematics",
    description: "Master mathematical concepts from basic to advanced",
    imageUrl: "/images/categories/mathematics.jpg",
    color: "bg-red-500",
    classes: [],
  },
}

export default function CategoryPage({ params }: { params: { id: string } }) {
  const category = categories[params.id as keyof typeof categories]

  if (!category) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="relative h-64 w-full mb-8 rounded-xl overflow-hidden">
        <Image
          src={category.imageUrl || "/placeholder.svg"}
          alt={category.title}
          fill
          className="object-cover"
          priority
        />
        <div className={`absolute inset-0 opacity-60 ${category.color}`}></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <h1 className="text-4xl font-bold mb-4">{category.title}</h1>
          <p className="text-xl max-w-2xl text-center">{category.description}</p>
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-6">Classes in {category.title}</h2>

      {category.classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {category.classes.map((course) => (
            <Link key={course.id} href={`/classes/${course.id}`}>
              <Card className="overflow-hidden h-full transition-transform hover:scale-[1.02]">
                <div className="relative h-48 w-full">
                  <Image src={course.imageUrl || "/placeholder.svg"} alt={course.title} fill className="object-cover" />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      {course.level}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-500">Instructor: {course.instructor}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">No classes available in this category yet.</p>
          <p className="mt-2">Check back soon for new content!</p>
        </div>
      )}

      <div className="mt-12 text-center">
        <Link href="/categories" className="text-blue-600 hover:underline">
          ← Back to all categories
        </Link>
      </div>
    </main>
  )
}
