import { Suspense } from "react"
import { CategoryGrid } from "@/components/category-grid"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function CategoriesPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">All Categories</h1>
      <Suspense fallback={<LoadingSpinner />}>
        <CategoryGrid />
      </Suspense>
    </main>
  )
}
