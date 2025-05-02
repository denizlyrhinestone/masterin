"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useCourseDetails } from "@/hooks/use-course-details"
import { CourseCurriculum } from "@/components/course-curriculum"
import { CourseReviews } from "@/components/course-reviews"
import { InstructorProfile } from "@/components/instructor-profile"
import { CourseEnrollment } from "@/components/course-enrollment"
import { CourseObjectives } from "@/components/course-objectives"
import { RelatedCourses } from "@/components/related-courses"

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.id as string
  const { course, isLoading, error } = useCourseDetails(courseId)
  const [activeTab, setActiveTab] = useState("overview")

  // Scroll to top when course changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [courseId])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Skeleton className="h-8 w-40" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="aspect-video w-full rounded-md" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-96 w-full rounded-md" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-md mx-auto text-center">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || "The course you're looking for doesn't exist or has been removed."}
          </p>
          <Button asChild>
            <Link href="/courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/courses" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg text-muted-foreground mb-6">{course.description}</p>

            <div className="aspect-video relative rounded-md overflow-hidden mb-6">
              <Image
                src={course.thumbnailUrl || "/placeholder.svg"}
                alt={course.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8 pt-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">About This Course</h3>
                <div className="prose max-w-none">
                  <p>{course.longDescription}</p>
                </div>
              </div>

              <CourseObjectives objectives={course.objectives || []} requirements={course.requirements} />

              <InstructorProfile instructor={course.instructorDetails!} />
            </TabsContent>

            <TabsContent value="curriculum" className="pt-6">
              <CourseCurriculum curriculum={course.curriculum!} isPurchased={false} />
            </TabsContent>

            <TabsContent value="reviews" className="pt-6">
              <CourseReviews courseId={course.id} />
            </TabsContent>
          </Tabs>

          {course.relatedCourseIds && course.relatedCourseIds.length > 0 && (
            <div className="pt-8 border-t">
              <RelatedCourses courseIds={course.relatedCourseIds} currentCourseId={course.id} />
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <CourseEnrollment
            id={course.id}
            title={course.title}
            price={course.price}
            duration={course.duration}
            level={course.level}
            enrolledCount={course.enrolledCount}
            lastUpdated={course.lastUpdated || course.updatedAt}
            certificateIncluded={course.certificateIncluded}
            isPurchased={false}
          />
        </div>
      </div>
    </div>
  )
}
