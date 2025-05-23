"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { supportsVideoElement, getSupportedFormats } from "@/lib/video-playback"
import CourseHeader from "@/components/courses/course-header"
import CourseContent from "@/components/courses/course-content"
import CourseInfo from "@/components/courses/course-info"
import CourseReviews from "@/components/courses/course-reviews"
import CourseMaterials from "@/components/courses/course-materials"
import EnrollmentSection from "@/components/courses/enrollment-section"
import type { Course } from "@/types"

interface CourseClientProps {
  course: Course
  userId?: string
}

export default function CourseClient({ course, userId }: CourseClientProps) {
  const [thumbnail, setThumbnail] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [videoSupported, setVideoSupported] = useState(true)
  const [supportedFormats, setSupportedFormats] = useState<{
    mp4: boolean
    webm: boolean
    ogg: boolean
    hls: boolean
  }>({ mp4: true, webm: true, ogg: false, hls: false })
  const { toast } = useToast()
  const [courseData, setCourseData] = useState(course) // Declare setCourse variable

  useEffect(() => {
    // Check video support
    const hasVideoSupport = supportsVideoElement()
    setVideoSupported(hasVideoSupport)

    if (!hasVideoSupport) {
      toast({
        title: "Video Playback Not Supported",
        description: "Your browser doesn't support HTML5 video playback. Please upgrade your browser.",
        variant: "destructive",
      })
    }

    // Get supported formats
    const formats = getSupportedFormats()
    setSupportedFormats(formats)

    // Fetch course data
    setIsLoading(true)
    try {
      const data = course
      setCourseData(data) // Use setCourse variable
      setThumbnail(data.thumbnail)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching course:", error)
      toast({
        title: "Error Loading Course",
        description: "There was a problem loading the course. Please try again later.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }, [course, toast])

  const handleThumbnailUpdate = (newThumbnailUrl: string) => {
    setThumbnail(newThumbnailUrl)
    // In a real app, you would save this to your database
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="aspect-video w-full rounded-md" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-6 w-full" />
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-4 w-3/4 mt-4" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <CourseHeader course={courseData} />

      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CourseContent course={courseData} />
            <CourseReviews course={courseData} userId={userId} />
          </div>

          <div className="lg:col-span-1 space-y-8">
            <EnrollmentSection course={courseData} enrollment={courseData.enrollment} userId={userId} />
            <CourseInfo course={courseData} />
            <CourseMaterials materials={courseData.materials} />
          </div>
        </div>
      </div>
    </div>
  )
}
