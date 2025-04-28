"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import { Clock, Users, Calendar, BookOpen, AlertTriangle } from "lucide-react"
import CourseVideoPreview from "@/components/course-video-preview"
import { supportsVideoElement, getSupportedFormats } from "@/lib/video-playback"

// Mock course data with video information
const getCourseData = (id: string) => {
  return {
    id,
    title: `Course ${id}`,
    description: "This is a comprehensive course that covers all the essential topics.",
    thumbnail: `/placeholder.svg?height=720&width=1280&query=course ${id} thumbnail`,
    videoUrl: "https://example.com/course-video.mp4", // Primary video URL
    videoFormats: {
      mp4: "https://example.com/course-video.mp4",
      webm: "https://example.com/course-video.webm",
      ogg: "https://example.com/course-video.ogv",
    },
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
  const [isLoading, setIsLoading] = useState(true)
  const [videoSupported, setVideoSupported] = useState(true)
  const [supportedFormats, setSupportedFormats] = useState<{
    mp4: boolean
    webm: boolean
    ogg: boolean
    hls: boolean
  }>({ mp4: true, webm: true, ogg: false, hls: false })
  const { toast } = useToast()

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
      const data = getCourseData(courseId)
      setCourse(data)
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
  }, [courseId, toast])

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

  if (!course) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Course Not Found</h2>
            <p className="text-gray-500 text-center mb-4">
              We couldn't find the course you're looking for. It may have been removed or the URL might be incorrect.
            </p>
            <Button asChild>
              <a href="/services">Browse All Courses</a>
            </Button>
          </CardContent>
        </Card>
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

                {videoSupported && (
                  <CourseVideoPreview
                    title={course.title}
                    videoUrl={course.videoUrl}
                    thumbnailUrl={thumbnail}
                    fallbackFormats={course.videoFormats}
                  />
                )}

                {!videoSupported && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-white p-4">
                    <AlertTriangle className="h-12 w-12 text-yellow-400 mb-2" />
                    <p className="text-center">
                      Your browser doesn't support video playback. Please upgrade your browser or download the video.
                    </p>
                  </div>
                )}
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

              {!supportedFormats.mp4 && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800">Limited Video Support</h4>
                      <p className="text-sm text-amber-700">
                        Your browser has limited support for video formats. For the best experience, we recommend using
                        Chrome, Firefox, or Safari.
                      </p>
                    </div>
                  </div>
                </div>
              )}
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

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Video Playback Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <h4 className="font-medium mb-2">Supported Formats</h4>
              <ul className="space-y-1 mb-4">
                <li className="flex items-center">
                  <span className={supportedFormats.mp4 ? "text-green-500 mr-2" : "text-red-500 mr-2"}>
                    {supportedFormats.mp4 ? "✓" : "✗"}
                  </span>
                  MP4 (H.264)
                </li>
                <li className="flex items-center">
                  <span className={supportedFormats.webm ? "text-green-500 mr-2" : "text-red-500 mr-2"}>
                    {supportedFormats.webm ? "✓" : "✗"}
                  </span>
                  WebM (VP8/VP9)
                </li>
                <li className="flex items-center">
                  <span className={supportedFormats.ogg ? "text-green-500 mr-2" : "text-red-500 mr-2"}>
                    {supportedFormats.ogg ? "✓" : "✗"}
                  </span>
                  Ogg Theora
                </li>
              </ul>

              <h4 className="font-medium mb-2">Recommended Browsers</h4>
              <p className="text-sm text-gray-600 mb-4">
                For the best experience, we recommend using Chrome, Firefox, or Safari.
              </p>

              <h4 className="font-medium mb-2">Troubleshooting</h4>
              <ul className="text-sm space-y-1">
                <li>• Enable JavaScript in your browser</li>
                <li>• Update your browser to the latest version</li>
                <li>• Check your internet connection</li>
                <li>• Try a different browser if videos won't play</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
