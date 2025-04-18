import { Button } from "@/components/ui/button"
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

// Sample class data for biology courses
const biologyClasses = [
  {
    id: "cell-biology",
    title: "Cell Biology",
    description: "Study of cell structure, function, and the life processes within cells",
    instructor: "Dr. Jane Smith",
    level: "Intermediate",
    duration: "8 weeks",
    students: 1245,
    rating: 4.8,
    image: "/placeholder.svg?height=200&width=400&query=cell+biology",
    featured: true,
  },
  {
    id: "genetics",
    title: "Genetics",
    description: "Principles of inheritance, DNA structure, and genetic engineering",
    instructor: "Prof. Michael Johnson",
    level: "Advanced",
    duration: "10 weeks",
    students: 892,
    rating: 4.6,
    image: "/placeholder.svg?height=200&width=400&query=genetics",
  },
  {
    id: "ecology",
    title: "Ecology",
    description: "Relationships between organisms and their environment",
    instructor: "Dr. Sarah Williams",
    level: "Beginner",
    duration: "6 weeks",
    students: 1032,
    rating: 4.7,
    image: "/placeholder.svg?height=200&width=400&query=ecology",
  },
  {
    id: "human-anatomy",
    title: "Human Anatomy",
    description: "Structure and organization of the human body",
    instructor: "Prof. Robert Chen",
    level: "Intermediate",
    duration: "8 weeks",
    students: 756,
    rating: 4.5,
    image: "/placeholder.svg?height=200&width=400&query=human+anatomy",
  },
]

// Sample class data for chemistry courses
const chemistryClasses = [
  {
    id: "atomic-structure",
    title: "Atomic Structure",
    description: "Understanding atoms, elements, and the periodic table",
    instructor: "Dr. Emily Parker",
    level: "Beginner",
    duration: "6 weeks",
    students: 945,
    rating: 4.7,
    image: "/placeholder.svg?height=200&width=400&query=atomic+structure",
    featured: true,
  },
  {
    id: "chemical-bonding",
    title: "Chemical Bonding",
    description: "Ionic, covalent, and metallic bonds between atoms",
    instructor: "Prof. David Wilson",
    level: "Intermediate",
    duration: "7 weeks",
    students: 782,
    rating: 4.5,
    image: "/placeholder.svg?height=200&width=400&query=chemical+bonding",
  },
]

// Categories data (simplified)
const categories = {
  biology: {
    name: "Biology",
    description: "Cell biology, genetics, evolution, ecology, and physiology",
    classes: biologyClasses,
    color: "bg-green-100 text-green-700",
  },
  chemistry: {
    name: "Chemistry",
    description: "Atomic structure, chemical bonding, reactions, and organic chemistry",
    classes: chemistryClasses,
    color: "bg-purple-100 text-purple-700",
  },
  "environmental-science": {
    name: "Environmental Science",
    description: "Ecosystems, biodiversity, climate change, and sustainability",
    classes: biologyClasses.slice(0, 2),
    color: "bg-teal-100 text-teal-700",
  },
  "marine-biology": {
    name: "Marine Biology",
    description: "Ocean ecosystems, marine organisms, and conservation",
    classes: biologyClasses.slice(1, 3),
    color: "bg-blue-100 text-blue-700",
  },
  "ap-biology": {
    name: "AP Biology",
    description: "Advanced placement biology for college credit",
    classes: biologyClasses,
    color: "bg-amber-100 text-amber-700",
  },
  mathematics: {
    name: "Mathematics",
    description: "Algebra, calculus, geometry, statistics, and trigonometry",
    classes: biologyClasses.slice(0, 3),
    color: "bg-blue-100 text-blue-700",
  },
  history: {
    name: "History",
    description: "World history, civilizations, important events, and cultural developments",
    classes: biologyClasses.slice(1, 4),
    color: "bg-orange-100 text-orange-700",
  },
  physics: {
    name: "Physics",
    description: "Mechanics, electricity, magnetism, thermodynamics, and quantum physics",
    classes: chemistryClasses,
    color: "bg-indigo-100 text-indigo-700",
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

        <div className="rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
          <Badge className={`mb-2 ${category.color}`}>{category.name}</Badge>
          <h1 className="text-3xl font-bold tracking-tight">{category.name} Courses</h1>
          <p className="mt-2 text-muted-foreground">{category.description}</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {category.classes.map((classItem) => (
          <div key={classItem.id} className="course-card overflow-hidden">
            <div className="relative">
              <img
                src={classItem.image || "/placeholder.svg"}
                alt={classItem.title}
                className="h-48 w-full object-cover"
              />
              {classItem.featured && <Badge className="absolute right-2 top-2 bg-primary text-white">Featured</Badge>}
            </div>
            <div className="p-6">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-bold">{classItem.title}</h3>
                <Badge variant="outline">{classItem.level}</Badge>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">{classItem.description}</p>
              <div className="mb-4 flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span>{classItem.duration}</span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span>{classItem.students.toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 text-amber-500" />
                  <span>{classItem.rating}</span>
                </div>
              </div>
              <Button asChild className="w-full">
                <Link href={`/classes/${classItem.id}`}>View Course</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
