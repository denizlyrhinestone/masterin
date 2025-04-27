"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import CourseThumbnailSelector from "@/components/course-thumbnail-selector"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

interface CourseEditPageProps {
  params: {
    id: string
  }
}

export default function CourseEditPage({ params }: CourseEditPageProps) {
  const { id } = params
  const [isLoading, setIsLoading] = useState(true)
  const [course, setCourse] = useState<any>(null)
  const { toast } = useToast()

  // Load course data
  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true)
      try {
        // In a real app, you would fetch from your API
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data - in a real app this would come from your API
        const mockCourse = {
          id,
          title: "Web Development Bootcamp",
          description: "A comprehensive course covering HTML, CSS, JavaScript, and modern frameworks.",
          image: "/course-web-development.png",
          videoUrl: "/videos/web-development-preview.mp4",
          level: "Beginner to Intermediate",
          duration: "16 weeks",
          students: "5,432",
          rating: 4.9,
          instructor: "Jessica Williams",
          price: "$79.99",
        }

        setCourse(mockCourse)
      } catch (error) {
        console.error("Error loading course:", error)
        toast({
          title: "Error",
          description: "Failed to load course data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourse()
  }, [id, toast])

  // Handle thumbnail selection
  const handleThumbnailSelect = (thumbnailUrl: string) => {
    setCourse({
      ...course,
      image: thumbnailUrl,
    })

    // In a real app, you would save this to your API
    toast({
      title: "Thumbnail updated",
      description: "Course thumbnail has been updated successfully",
    })
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, you would save to your API
    toast({
      title: "Course updated",
      description: "Course has been updated successfully",
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center h-96">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md w-64"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-96"></div>
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-md w-full max-w-2xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The course you are looking for does not exist or has been removed.
          </p>
          <Link href="/admin/courses">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Course</h1>
          <p className="text-gray-500 dark:text-gray-400">Update course details and media</p>
        </div>
        <div className="flex space-x-2">
          <Link href="/admin/courses">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <Button onClick={handleSubmit}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
                <CardDescription>Edit the basic information about your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    value={course.title}
                    onChange={(e) => setCourse({ ...course, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={course.description}
                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Input
                      id="level"
                      value={course.level}
                      onChange={(e) => setCourse({ ...course, level: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={course.duration}
                      onChange={(e) => setCourse({ ...course, duration: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instructor">Instructor</Label>
                    <Input
                      id="instructor"
                      value={course.instructor}
                      onChange={(e) => setCourse({ ...course, instructor: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      value={course.price}
                      onChange={(e) => setCourse({ ...course, price: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Course Media</CardTitle>
              <CardDescription>Manage your course thumbnail and preview video</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Thumbnail</Label>
                <div className="relative aspect-video rounded-md overflow-hidden">
                  <Image
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <CourseThumbnailSelector
                    courseId={id}
                    currentThumbnail={course.image}
                    videoUrl={course.videoUrl}
                    onThumbnailSelect={handleThumbnailSelect}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Preview Video</Label>
                <div className="aspect-video bg-black rounded-md overflow-hidden">
                  <video src={course.videoUrl} controls className="w-full h-full" poster={course.image} />
                </div>
                <div className="flex justify-end mt-2">
                  <Button variant="outline" size="sm">
                    Change Video
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Generated Thumbnails</CardTitle>
              <CardDescription>Create thumbnails from your course video</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Generate custom thumbnails from your course preview video
                </p>
                <Button asChild>
                  <Link href="/admin/thumbnails">Generate Thumbnails</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
