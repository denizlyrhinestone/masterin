import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

// Define the categories with images
const categories = [
  {
    id: "programming",
    title: "Programming",
    description: "Learn coding, web development, and software engineering",
    imageUrl: "/images/categories/programming.jpg",
    color: "bg-blue-500",
  },
  {
    id: "data-science",
    title: "Data Science",
    description: "Master data analysis, machine learning, and AI concepts",
    imageUrl: "/images/categories/data-science.jpg",
    color: "bg-purple-500",
  },
  {
    id: "design",
    title: "Design",
    description: "Explore UI/UX, graphic design, and creative tools",
    imageUrl: "/images/categories/design.jpg",
    color: "bg-pink-500",
  },
  {
    id: "business",
    title: "Business",
    description: "Develop entrepreneurship and management skills",
    imageUrl: "/images/categories/business.jpg",
    color: "bg-green-500",
  },
  {
    id: "languages",
    title: "Languages",
    description: "Learn new languages with interactive lessons",
    imageUrl: "/images/categories/languages.jpg",
    color: "bg-yellow-500",
  },
  {
    id: "mathematics",
    title: "Mathematics",
    description: "Master mathematical concepts from basic to advanced",
    imageUrl: "/images/categories/mathematics.jpg",
    color: "bg-red-500",
  },
]

export function CategoryGrid() {
  return (
    <section>
      <h2 className="text-3xl font-bold mb-8 text-center">Explore Categories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link key={category.id} href={`/categories/${category.id}`}>
            <Card className="overflow-hidden h-full transition-transform hover:scale-[1.02]">
              <div className="relative h-48 w-full">
                <Image
                  src={category.imageUrl || "/placeholder.svg"}
                  alt={category.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className={`absolute inset-0 opacity-60 ${category.color}`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-2xl font-bold text-white">{category.title}</h3>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-gray-600">{category.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
