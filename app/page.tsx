"use client"
import { useRouter } from "next/navigation"
import { CourseCard } from "@/components/dashboard/course-card"
import { getFeaturedCourses } from "@/lib/courses-data"
import { useIsMobile } from "@/hooks/use-mobile"
import { Hero } from "@/components/hero"

export default function LoginPage() {
  const router = useRouter()
  const isMobile = useIsMobile()

  return (
    <>
      <Hero />
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Featured Courses</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {getFeaturedCourses().map((course) => (
            <CourseCard
              key={course.id}
              id={course.slug}
              title={course.title}
              description={course.description}
              progress={0}
              image={course.thumbnail}
            />
          ))}
        </div>
      </div>
    </>
  )
}
