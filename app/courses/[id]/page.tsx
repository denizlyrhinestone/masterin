"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { Clock, Users, Calendar, BookOpen } from "lucide-react"
import CourseThumbnailSelector from "@/components/course-thumbnail-selector"

// Mock course data
const getCourseData = (id: string) => {
  return {
    id,
    title: `Course ${id}`,
    description: "This is a comprehensive course that covers all the essential topics.",
    thumbnail: `/placeholder.svg?height=720&width=1280&query=course ${id} thumbnail`,
    videoUrl: "https://example.com/course-video.mp4",
    instructor: "Dr. Jane Smith",
    duration: "10 weeks",
    students: 1250,
    lastUpdated: "2023-09-15",
    modules: 12,
  }
}

export default function CoursePage() {
  const params = useParams()
  const courseId = params.id as string
  const [course, setCourse] = useState<any>(null)
  const [thumbnail, setThumbnail] = useState<string>("")

  useEffect(() => {
    // Fetch course data
    const data = getCourseData(courseId)
    setCourse(data)
    setThumbnail(data.thumbnail)
  }, [courseId])

  const handleThumbnailUpdate = (newThumbnailUrl: string) => {
    setThumbnail(newThumbnailUrl)
    // In a real app, you would save this to your database
  }

  if (!course) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center h-64">
          <p>Loading course...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{course.title}</CardTitle>
                  <CardDescription className="mt-2">{course.description}</CardDescription>
                </div>
                <CourseThumbnailSelector
                  courseId={courseId}
                  currentThumbnail={thumbnail}
                  videoUrl={course.videoUrl}
                  onThumbnailSelect={handleThumbnailUpdate}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video relative rounded-md overflow-hidden mb-6">
                <Image
                  src={thumbnail || "/placeholder.svg"}
                  alt={course.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-500" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-gray-500" />
                  <span>{course.students} students</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                  <span>Updated {course.lastUpdated}</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-gray-500" />
                  <span>{course.modules} modules</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="modules">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="modules">Modules</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="discussions">Discussions</TabsTrigger>
                </TabsList>
                <TabsContent value="modules" className="space-y-4 mt-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="border rounded-md p-4">
                      <h3 className="font-medium">
                        Module {i + 1}: Introduction to Topic {i + 1}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Learn the fundamentals of this topic through video lectures and exercises.
                      </p>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="resources" className="mt-4">
                  <p>Course resources will be displayed here.</p>
                </TabsContent>
                <TabsContent value="discussions" className="mt-4">
                  <p>Course discussions will be displayed here.</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image src="/thoughtful-instructor.png" alt={course.instructor} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-medium">{course.instructor}</h3>
                  <p className="text-sm text-gray-500">Professor of Computer Science</p>
                </div>
              </div>
              <p className="text-sm mt-4">
                An experienced educator with over 10 years of teaching experience in this field.
              </p>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>What You'll Learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Key learning outcome {i + 1} from this comprehensive course</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Enroll in Course</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
