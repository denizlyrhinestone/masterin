import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import { ArrowLeft, Clock, Star, Users } from "lucide-react"

// Sample class data
const classes = [
  {
    id: "algebra-101",
    title: "Algebra 101",
    description: "Introduction to algebraic concepts and problem-solving techniques",
    instructor: "Dr. Jane Smith",
    level: "Beginner",
    duration: "8 weeks",
    students: 1245,
    rating: 4.8,
    image: "/placeholder.svg?height=200&width=400&query=algebra",
  },
  {
    id: "calculus-fundamentals",
    title: "Calculus Fundamentals",
    description: "Learn the basics of differential and integral calculus",
    instructor: "Prof. Michael Johnson",
    level: "Intermediate",
    duration: "10 weeks",
    students: 892,
    rating: 4.6,
    image: "/placeholder.svg?height=200&width=400&query=calculus",
  },
  {
    id: "geometry-basics",
    title: "Geometry Basics",
    description: "Explore the fundamental concepts of Euclidean geometry",
    instructor: "Dr. Sarah Williams",
    level: "Beginner",
    duration: "6 weeks",
    students: 1032,
    rating: 4.7,
    image: "/placeholder.svg?height=200&width=400&query=geometry",
  },
  {
    id: "statistics-intro",
    title: "Introduction to Statistics",
    description: "Learn statistical methods and data analysis techniques",
    instructor: "Prof. Robert Chen",
    level: "Beginner",
    duration: "8 weeks",
    students: 756,
    rating: 4.5,
    image: "/placeholder.svg?height=200&width=400&query=statistics",
  },
]

// Categories data (simplified)
const categories = {
  mathematics: {
    name: "Mathematics",
    description: "Algebra, Calculus, Geometry, Statistics, and more",
  },
  science: {
    name: "Science",
    description: "Physics, Chemistry, Biology, Astronomy, and more",
  },
  "computer-science": {
    name: "Computer Science",
    description: "Programming, Algorithms, Data Structures, and more",
  },
  "language-arts": {
    name: "Language Arts",
    description: "Literature, Writing, Grammar, and more",
  },
  "social-studies": {
    name: "Social Studies",
    description: "History, Geography, Economics, and more",
  },
  arts: {
    name: "Arts",
    description: "Visual Arts, Music, Theater, and more",
  },
}

export default function CategoryPage({ params }: { params: { id: string } }) {
  const category = categories[params.id as keyof typeof categories]

  if (!category) {
    return <div className="container mx-auto p-6">Category not found</div>
  }

  return (
    <div className="container mx-auto p-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/categories">Categories</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{category.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
        <p className="text-muted-foreground">{category.description}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {classes.map((classItem) => (
          <Card key={classItem.id} className="overflow-hidden">
            <img
              src={classItem.image || "/placeholder.svg"}
              alt={classItem.title}
              className="h-48 w-full object-cover"
            />
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{classItem.title}</CardTitle>
                <Badge>{classItem.level}</Badge>
              </div>
              <CardDescription>{classItem.instructor}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{classItem.description}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span>{classItem.duration}</span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span>{classItem.students.toLocaleString()} students</span>
                </div>
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 text-amber-500" />
                  <span>{classItem.rating}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/classes/${classItem.id}`}>View Class</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
