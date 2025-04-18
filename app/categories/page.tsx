import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// Sample category data
const categories = [
  {
    id: "mathematics",
    name: "Mathematics",
    description: "Algebra, Calculus, Geometry, Statistics, and more",
    count: 24,
    icon: "/abstract-mathematics.png",
    popular: true,
  },
  {
    id: "science",
    name: "Science",
    description: "Physics, Chemistry, Biology, Astronomy, and more",
    count: 32,
    icon: "/colorful-science-lab.png",
    popular: true,
  },
  {
    id: "computer-science",
    name: "Computer Science",
    description: "Programming, Algorithms, Data Structures, and more",
    count: 18,
    icon: "/modern-desktop-setup.png",
    popular: true,
  },
  {
    id: "language-arts",
    name: "Language Arts",
    description: "Literature, Writing, Grammar, and more",
    count: 15,
    icon: "/linguistic-diversity.png",
    popular: false,
  },
  {
    id: "social-studies",
    name: "Social Studies",
    description: "History, Geography, Economics, and more",
    count: 20,
    icon: "/placeholder.svg?height=40&width=40&query=history",
    popular: false,
  },
  {
    id: "arts",
    name: "Arts",
    description: "Visual Arts, Music, Theater, and more",
    count: 12,
    icon: "/placeholder.svg?height=40&width=40&query=art",
    popular: false,
  },
]

export default function CategoriesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">Browse all subject categories to find the perfect class for you.</p>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Categories</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="recent">Recently Added</TabsTrigger>
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
        <TabsContent value="recent" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, 3).map((category) => (
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
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <img
          src={category.icon || "/placeholder.svg"}
          alt={category.name}
          className="h-10 w-10 rounded-md object-cover"
        />
        <div>
          <CardTitle>{category.name}</CardTitle>
          <CardDescription>{category.count} classes</CardDescription>
        </div>
        {category.popular && (
          <Badge variant="secondary" className="ml-auto">
            Popular
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{category.description}</p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/categories/${category.id}`}>Browse Classes</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
