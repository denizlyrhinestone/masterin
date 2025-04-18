import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Sample category data with expanded subjects for middle and high school
const categories = [
  {
    id: "biology",
    name: "Biology",
    description: "Cell biology, genetics, evolution, ecology, and physiology",
    count: 24,
    icon: "/microscopic-life.png",
    popular: true,
    color: "bg-green-100 text-green-700",
    iconBg: "bg-green-100",
  },
  {
    id: "chemistry",
    name: "Chemistry",
    description: "Atomic structure, chemical bonding, reactions, and organic chemistry",
    count: 18,
    icon: "/colorful-chemistry-lab.png",
    popular: true,
    color: "bg-purple-100 text-purple-700",
    iconBg: "bg-purple-100",
  },
  {
    id: "environmental-science",
    name: "Environmental Science",
    description: "Ecosystems, biodiversity, climate change, and sustainability",
    count: 12,
    icon: "/interconnected-ecosystems.png",
    popular: false,
    color: "bg-teal-100 text-teal-700",
    iconBg: "bg-teal-100",
  },
  {
    id: "marine-biology",
    name: "Marine Biology",
    description: "Ocean ecosystems, marine organisms, and conservation",
    count: 8,
    icon: "/placeholder.svg?height=40&width=40&query=marine+biology",
    popular: false,
    color: "bg-blue-100 text-blue-700",
    iconBg: "bg-blue-100",
  },
  {
    id: "ap-biology",
    name: "AP Biology",
    description: "Advanced placement biology for college credit",
    count: 15,
    icon: "/placeholder.svg?height=40&width=40&query=ap+biology",
    popular: true,
    color: "bg-amber-100 text-amber-700",
    iconBg: "bg-amber-100",
    featured: true,
  },
  {
    id: "mathematics",
    name: "Mathematics",
    description: "Algebra, calculus, geometry, statistics, and trigonometry",
    count: 30,
    icon: "/placeholder.svg?height=40&width  geometry, statistics, and trigonometry",
    count: 30,
    icon: "/abstract-mathematics.png",
    popular: true,
    color: "bg-blue-100 text-blue-700",
    iconBg: "bg-blue-100",
  },
  {
    id: "history",
    name: "History",
    description: "World history, civilizations, important events, and cultural developments",
    count: 20,
    icon: "/ancient-civilizations-timeline.png",
    popular: false,
    color: "bg-orange-100 text-orange-700",
    iconBg: "bg-orange-100",
  },
  {
    id: "physics",
    name: "Physics",
    description: "Mechanics, electricity, magnetism, thermodynamics, and quantum physics",
    count: 16,
    icon: "/placeholder.svg?height=40&width=40&query=physics",
    popular: false,
    color: "bg-indigo-100 text-indigo-700",
    iconBg: "bg-indigo-100",
  },
]

export default function CategoriesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Explore Categories</h1>
        <p className="text-muted-foreground">
          Discover a wide range of subjects tailored for middle and high school students.
        </p>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="mb-6 w-full justify-start rounded-lg bg-muted p-1">
          <TabsTrigger value="all" className="rounded-md">
            All Categories
          </TabsTrigger>
          <TabsTrigger value="popular" className="rounded-md">
            Popular
          </TabsTrigger>
          <TabsTrigger value="featured" className="rounded-md">
            Featured
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories
              .filter((c) => c.popular)
              .map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="featured" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories
              .filter((c) => c.featured)
              .map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CategoryCard({ category }: { category: (typeof categories)[0] }) {
  return (
    <Link href={`/categories/${category.id}`} className="category-card block">
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${category.iconBg}`}>
            <img src={category.icon || "/placeholder.svg"} alt={category.name} className="h-8 w-8" />
          </div>
          {category.popular && (
            <Badge variant="secondary" className={category.color}>
              Popular
            </Badge>
          )}
          {category.featured && (
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              Featured
            </Badge>
          )}
        </div>
        <h3 className="mb-2 text-lg font-bold">{category.name}</h3>
        <p className="mb-4 text-sm text-muted-foreground">{category.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{category.count} courses</span>
          <Button variant="ghost" size="sm" className="rounded-full">
            Explore
          </Button>
        </div>
      </div>
    </Link>
  )
}
