"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Image from "next/image"
import {
  Play,
  Pause,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Filter,
  ImageIcon,
  Video,
  Info,
} from "lucide-react"

// Mock course data
const MOCK_COURSES = [
  {
    id: "course-1",
    title: "Introduction to Web Development",
    videoUrl: "/videos/web-dev-intro.mp4",
    thumbnail: "/course-web-development.png",
    duration: 3600,
    hasVideo: true,
  },
  {
    id: "course-2",
    title: "Python Programming Fundamentals",
    videoUrl: "/videos/python-basics.mp4",
    thumbnail: "/course-python-programming.png",
    duration: 4800,
    hasVideo: true,
  },
  {
    id: "course-3",
    title: "Data Science Essentials",
    videoUrl: "/videos/data-science.mp4",
    thumbnail: "/course-data-science.png",
    duration: 5400,
    hasVideo: true,
  },
  {
    id: "course-4",
    title: "Machine Learning Fundamentals",
    videoUrl: "/videos/ml-basics.mp4",
    thumbnail: "/course-machine-learning.png",
    duration: 7200,
    hasVideo: true,
  },
  {
    id: "course-5",
    title: "AI for Beginners",
    videoUrl: "/videos/ai-intro.mp4",
    thumbnail: "/course-ai-fundamentals.png",
    duration: 3200,
    hasVideo: true,
  },
  {
    id: "course-6",
    title: "Digital Marketing Strategies",
    videoUrl: "/videos/digital-marketing.mp4",
    thumbnail: "/course-digital-marketing.png",
    duration: 2700,
    hasVideo: true,
  },
  {
    id: "course-7",
    title: "Advanced JavaScript",
    videoUrl: null,
    thumbnail: "/javascript-code-abstract.png",
    duration: 0,
    hasVideo: false,
  },
  {
    id: "course-8",
    title: "UX/UI Design Principles",
    videoUrl: null,
    thumbnail: "/modern-dashboard-overview.png",
    duration: 0,
    hasVideo: false,
  },
]

// Types
type CourseWithSelection = (typeof MOCK_COURSES)[0] & { selected: boolean }
type ProcessingStatus = "pending" | "processing" | "completed" | "failed"

interface ProcessingResult {
  courseId: string
  courseTitle: string
  status: ProcessingStatus
  thumbnails: string[]
  selectedThumbnail: string | null
  error?: string
  processingTime?: number
}

export default function BatchThumbnailGeneratorPage() {
  const [courses, setCourses] = useState<CourseWithSelection[]>([])
  const [filteredCourses, setFilteredCourses] = useState<CourseWithSelection[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<ProcessingResult[]>([])
  const [activeFilter, setActiveFilter] = useState<"all" | "with-video" | "without-thumbnail">("all")
  const { toast } = useToast()

  // Load courses on mount
  useEffect(() => {
    // In a real app, this would fetch from an API
    const loadedCourses = MOCK_COURSES.map((course) => ({
      ...course,
      selected: false,
    }))
    setCourses(loadedCourses)
    setFilteredCourses(loadedCourses)
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...courses]

    if (activeFilter === "with-video") {
      filtered = filtered.filter((course) => course.hasVideo)
    } else if (activeFilter === "without-thumbnail") {
      filtered = filtered.filter((course) => !course.thumbnail || course.thumbnail.includes("placeholder"))
    }

    setFilteredCourses(filtered)
  }, [courses, activeFilter])

  // Toggle course selection
  const toggleCourseSelection = (courseId: string) => {
    setCourses((prevCourses) =>
      prevCourses.map((course) => (course.id === courseId ? { ...course, selected: !course.selected } : course)),
    )
  }

  // Select all visible courses
  const selectAllVisible = () => {
    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        const isVisible = filteredCourses.some((fc) => fc.id === course.id)
        return isVisible ? { ...course, selected: true } : course
      }),
    )
  }

  // Deselect all courses
  const deselectAll = () => {
    setCourses((prevCourses) => prevCourses.map((course) => ({ ...course, selected: false })))
  }

  // Start batch processing
  const startProcessing = () => {
    const selectedCourses = courses.filter((course) => course.selected)

    if (selectedCourses.length === 0) {
      toast({
        title: "No courses selected",
        description: "Please select at least one course to process",
        variant: "destructive",
      })
      return
    }

    // Initialize results
    const initialResults: ProcessingResult[] = selectedCourses.map((course) => ({
      courseId: course.id,
      courseTitle: course.title,
      status: "pending",
      thumbnails: [],
      selectedThumbnail: null,
    }))

    setResults(initialResults)
    setIsProcessing(true)
    setIsPaused(false)
    setCurrentIndex(0)
    setProgress(0)

    // Start processing the first course
    processCourse(0, selectedCourses)
  }

  // Process a single course
  const processCourse = (index: number, selectedCourses: CourseWithSelection[]) => {
    if (index >= selectedCourses.length) {
      // All courses processed
      setIsProcessing(false)
      toast({
        title: "Batch processing completed",
        description: `Processed ${selectedCourses.length} courses`,
      })
      return
    }

    setCurrentIndex(index)
    const course = selectedCourses[index]

    // Update status to processing
    setResults((prevResults) =>
      prevResults.map((result) =>
        result.courseId === course.id ? { ...result, status: "processing" as ProcessingStatus } : result,
      ),
    )

    // Simulate processing time based on course duration
    const processingTime = course.hasVideo ? Math.max(2000, Math.min(5000, course.duration / 1000)) : 1000

    setTimeout(() => {
      if (isPaused) {
        // If paused, don't proceed to the next course
        return
      }

      // Generate mock thumbnails if the course has a video
      if (course.hasVideo) {
        const mockThumbnails = [
          `/placeholder.svg?height=720&width=1280&query=${encodeURIComponent(course.title)} thumbnail 1`,
          `/placeholder.svg?height=720&width=1280&query=${encodeURIComponent(course.title)} thumbnail 2`,
          `/placeholder.svg?height=720&width=1280&query=${encodeURIComponent(course.title)} thumbnail 3`,
          `/placeholder.svg?height=720&width=1280&query=${encodeURIComponent(course.title)} thumbnail 4`,
        ]

        // Update results with success
        setResults((prevResults) =>
          prevResults.map((result) =>
            result.courseId === course.id
              ? {
                  ...result,
                  status: "completed",
                  thumbnails: mockThumbnails,
                  selectedThumbnail: mockThumbnails[1], // Select second thumbnail as "best"
                  processingTime,
                }
              : result,
          ),
        )
      } else {
        // Update results with failure for courses without videos
        setResults((prevResults) =>
          prevResults.map((result) =>
            result.courseId === course.id
              ? {
                  ...result,
                  status: "failed",
                  error: "No video available for this course",
                  processingTime,
                }
              : result,
          ),
        )
      }

      // Update progress
      const newProgress = Math.round(((index + 1) / selectedCourses.length) * 100)
      setProgress(newProgress)

      // Process next course
      processCourse(index + 1, selectedCourses)
    }, processingTime)
  }

  // Pause/resume processing
  const togglePause = () => {
    if (isPaused) {
      // Resume processing
      setIsPaused(false)
      const selectedCourses = courses.filter((course) => course.selected)
      processCourse(currentIndex, selectedCourses)
    } else {
      // Pause processing
      setIsPaused(true)
      toast({
        title: "Processing paused",
        description: "You can resume processing at any time",
      })
    }
  }

  // Cancel processing
  const cancelProcessing = () => {
    setIsProcessing(false)
    setIsPaused(false)
    toast({
      title: "Processing cancelled",
      description: "Batch processing has been cancelled",
    })
  }

  // Apply generated thumbnails to courses
  const applyThumbnails = () => {
    const successfulResults = results.filter((result) => result.status === "completed" && result.selectedThumbnail)

    if (successfulResults.length === 0) {
      toast({
        title: "No thumbnails to apply",
        description: "There are no successfully generated thumbnails to apply",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would call an API to update the courses
    toast({
      title: "Thumbnails applied",
      description: `Applied thumbnails to ${successfulResults.length} courses`,
    })

    // Update local course data with new thumbnails
    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        const result = successfulResults.find((r) => r.courseId === course.id)
        return result ? { ...course, thumbnail: result.selectedThumbnail || course.thumbnail } : course
      }),
    )
  }

  // Format time (ms) to readable duration
  const formatTime = (ms: number) => {
    if (!ms) return "0s"
    const seconds = Math.floor(ms / 1000)
    return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Batch Thumbnail Generator</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Generate thumbnails for multiple courses at once</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Course Selection</CardTitle>
                  <CardDescription>Select courses to process</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={selectAllVisible} disabled={isProcessing}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAll} disabled={isProcessing}>
                    Deselect All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Filter:</span>
                <div className="flex space-x-2">
                  <Badge
                    variant={activeFilter === "all" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setActiveFilter("all")}
                  >
                    All
                  </Badge>
                  <Badge
                    variant={activeFilter === "with-video" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setActiveFilter("with-video")}
                  >
                    With Video
                  </Badge>
                  <Badge
                    variant={activeFilter === "without-thumbnail" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setActiveFilter("without-thumbnail")}
                  >
                    Needs Thumbnail
                  </Badge>
                </div>
              </div>

              <ScrollArea className="h-[400px] rounded-md border">
                <div className="p-4 space-y-4">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <div key={course.id} className="flex items-start space-x-4">
                        <Checkbox
                          id={`course-${course.id}`}
                          checked={course.selected}
                          onCheckedChange={() => toggleCourseSelection(course.id)}
                          disabled={isProcessing}
                        />
                        <div className="flex flex-1 space-x-4">
                          <div className="relative w-32 h-18 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                              src={course.thumbnail || "/placeholder.svg"}
                              alt={course.title}
                              fill
                              className="object-cover"
                              sizes="128px"
                            />
                            {!course.hasVideo && (
                              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                <Badge variant="destructive">No Video</Badge>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <label
                              htmlFor={`course-${course.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {course.title}
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                              {course.hasVideo
                                ? `Video duration: ${Math.floor(course.duration / 60)}m ${course.duration % 60}s`
                                : "No video available"}
                            </p>
                            <div className="flex items-center mt-2 space-x-2">
                              {course.hasVideo ? (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-50 text-green-700 border-green-200"
                                >
                                  <Video className="h-3 w-3 mr-1" />
                                  Has Video
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  No Video
                                </Badge>
                              )}

                              {course.thumbnail && !course.thumbnail.includes("placeholder") ? (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  <ImageIcon className="h-3 w-3 mr-1" />
                                  Has Thumbnail
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200"
                                >
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Needs Thumbnail
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">No courses match the current filter</div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-gray-500">
                {courses.filter((c) => c.selected).length} of {courses.length} courses selected
              </div>
              <Button
                onClick={startProcessing}
                disabled={isProcessing || courses.filter((c) => c.selected).length === 0}
              >
                Generate Thumbnails
              </Button>
            </CardFooter>
          </Card>

          {isProcessing && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Processing Status</CardTitle>
                <CardDescription>
                  {isPaused
                    ? "Processing is paused"
                    : `Processing course ${currentIndex + 1} of ${courses.filter((c) => c.selected).length}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progress} className="h-2" />

                <div className="flex justify-between text-sm text-gray-500">
                  <span>{progress}% complete</span>
                  <span>
                    {currentIndex} of {courses.filter((c) => c.selected).length} processed
                  </span>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2">Currently Processing:</h3>
                  {courses.filter((c) => c.selected)[currentIndex] ? (
                    <div className="flex items-center space-x-3">
                      <RefreshCw className="h-4 w-4 animate-spin text-purple-500" />
                      <span>{courses.filter((c) => c.selected)[currentIndex]?.title}</span>
                    </div>
                  ) : (
                    <div className="text-gray-500">Completed</div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={cancelProcessing}>
                  Cancel
                </Button>
                <Button onClick={togglePause}>
                  {isPaused ? (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Processing Results</CardTitle>
              <CardDescription>
                {results.length > 0
                  ? `${results.filter((r) => r.status === "completed").length} of ${results.length} completed successfully`
                  : "No results yet"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results.length > 0 ? (
                <Tabs defaultValue="summary">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-md p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {results.filter((r) => r.status === "completed").length}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">Successful</div>
                      </div>

                      <div className="bg-red-50 dark:bg-red-900/20 rounded-md p-4 text-center">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {results.filter((r) => r.status === "failed").length}
                        </div>
                        <div className="text-sm text-red-600 dark:text-red-400">Failed</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
                      <h3 className="text-sm font-medium mb-2">Processing Time</h3>
                      <div className="text-sm text-gray-500">
                        <div className="flex justify-between mb-1">
                          <span>Average:</span>
                          <span>
                            {formatTime(
                              results
                                .filter((r) => r.processingTime)
                                .reduce((acc, curr) => acc + (curr.processingTime || 0), 0) /
                                results.filter((r) => r.processingTime).length || 0,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Total:</span>
                          <span>{formatTime(results.reduce((acc, curr) => acc + (curr.processingTime || 0), 0))}</span>
                        </div>
                      </div>
                    </div>

                    {results.some((r) => r.status === "failed") && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Processing Errors</AlertTitle>
                        <AlertDescription>
                          {results.filter((r) => r.status === "failed").length} courses failed to process. Check the
                          details tab for more information.
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  <TabsContent value="details" className="pt-4">
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {results.map((result) => (
                          <div key={result.courseId} className="border rounded-md overflow-hidden">
                            <div
                              className={`px-4 py-2 text-sm font-medium ${
                                result.status === "completed"
                                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                  : result.status === "failed"
                                    ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                                    : result.status === "processing"
                                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                      : "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  {result.status === "completed" && <CheckCircle2 className="h-4 w-4 mr-2" />}
                                  {result.status === "failed" && <XCircle className="h-4 w-4 mr-2" />}
                                  {result.status === "processing" && (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  )}
                                  {result.status === "pending" && <Clock className="h-4 w-4 mr-2" />}
                                  {result.courseTitle}
                                </div>
                                {result.processingTime && (
                                  <span className="text-xs">{formatTime(result.processingTime)}</span>
                                )}
                              </div>
                            </div>

                            <div className="p-4">
                              {result.status === "completed" && result.thumbnails.length > 0 ? (
                                <div className="space-y-3">
                                  <div className="text-xs text-gray-500 mb-2">
                                    Generated {result.thumbnails.length} thumbnails
                                  </div>

                                  <div className="grid grid-cols-4 gap-2">
                                    {result.thumbnails.map((thumbnail, idx) => (
                                      <div
                                        key={idx}
                                        className={`relative aspect-video rounded-sm overflow-hidden border ${
                                          thumbnail === result.selectedThumbnail
                                            ? "border-green-500 dark:border-green-400"
                                            : "border-transparent"
                                        }`}
                                      >
                                        <Image
                                          src={thumbnail || "/placeholder.svg"}
                                          alt={`Thumbnail ${idx + 1}`}
                                          fill
                                          className="object-cover"
                                          sizes="(max-width: 768px) 25vw, 100px"
                                        />
                                        {thumbnail === result.selectedThumbnail && (
                                          <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                                            <CheckCircle2 className="h-3 w-3 text-white" />
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : result.status === "failed" ? (
                                <div className="text-sm text-red-600 dark:text-red-400">
                                  {result.error || "Failed to generate thumbnails"}
                                </div>
                              ) : result.status === "processing" ? (
                                <div className="text-sm text-blue-600 dark:text-blue-400">Processing...</div>
                              ) : (
                                <div className="text-sm text-gray-500">Waiting to be processed</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Info className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No processing results yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Select courses and start processing to see results here
                  </p>
                </div>
              )}
            </CardContent>
            {results.length > 0 && results.some((r) => r.status === "completed") && (
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={applyThumbnails}
                  disabled={isProcessing || !results.some((r) => r.status === "completed")}
                >
                  Apply All Thumbnails
                </Button>
              </CardFooter>
            )}
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Batch Settings</CardTitle>
              <CardDescription>Configure batch processing options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-apply thumbnails</span>
                  <Checkbox id="auto-apply" disabled={isProcessing} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Skip courses with thumbnails</span>
                  <Checkbox id="skip-with-thumbnails" disabled={isProcessing} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Process in background</span>
                  <Checkbox id="background-processing" disabled={isProcessing} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Send email when complete</span>
                  <Checkbox id="email-notification" disabled={isProcessing} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
