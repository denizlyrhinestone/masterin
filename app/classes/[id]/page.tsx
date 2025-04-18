import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import { ArrowLeft, BookOpen, CheckCircle2, Clock, FileText, Play, Star, Users, Video } from "lucide-react"

// Sample class data
const classData = {
  "algebra-101": {
    title: "Algebra 101",
    description:
      "Introduction to algebraic concepts and problem-solving techniques. This course covers fundamental algebraic operations, equations, inequalities, functions, and their applications.",
    instructor: "Dr. Jane Smith",
    level: "Beginner",
    duration: "8 weeks",
    students: 1245,
    rating: 4.8,
    progress: 65,
    image: "/placeholder.svg?height=400&width=800&query=algebra",
    modules: [
      {
        title: "Introduction to Algebra",
        lessons: [
          { title: "What is Algebra?", duration: "10 min", type: "video", completed: true },
          { title: "Basic Algebraic Operations", duration: "15 min", type: "video", completed: true },
          { title: "Practice Problems", duration: "20 min", type: "quiz", completed: true },
        ],
      },
      {
        title: "Linear Equations",
        lessons: [
          { title: "Solving Linear Equations", duration: "12 min", type: "video", completed: true },
          { title: "Applications of Linear Equations", duration: "18 min", type: "video", completed: false },
          { title: "Practice Problems", duration: "25 min", type: "quiz", completed: false },
        ],
      },
      {
        title: "Quadratic Equations",
        lessons: [
          { title: "Introduction to Quadratic Equations", duration: "15 min", type: "video", completed: false },
          { title: "Solving Quadratic Equations", duration: "20 min", type: "video", completed: false },
          { title: "Applications of Quadratic Equations", duration: "18 min", type: "video", completed: false },
          { title: "Practice Problems", duration: "30 min", type: "quiz", completed: false },
        ],
      },
    ],
    resources: [
      { title: "Algebra Textbook", type: "pdf", size: "8.5 MB" },
      { title: "Formula Sheet", type: "pdf", size: "1.2 MB" },
      { title: "Practice Workbook", type: "pdf", size: "5.3 MB" },
    ],
  },
  // Add more classes as needed
}

export default function ClassDetailPage({ params }: { params: { id: string } }) {
  const classItem = classData[params.id as keyof typeof classData]

  if (!classItem) {
    return <div className="container mx-auto p-6">Class not found</div>
  }

  // Find the next incomplete lesson
  let nextLesson = { module: "", lesson: "" }
  for (const module of classItem.modules) {
    const incompleteLesson = module.lessons.find((lesson) => !lesson.completed)
    if (incompleteLesson) {
      nextLesson = { module: module.title, lesson: incompleteLesson.title }
      break
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/classes">Classes</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{classItem.title}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/classes">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Classes
        </Link>
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <img
            src={classItem.image || "/placeholder.svg"}
            alt={classItem.title}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />

          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">{classItem.title}</h1>
            <p className="text-muted-foreground mt-2">{classItem.description}</p>
          </div>

          <Tabs defaultValue="curriculum">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
            </TabsList>

            <TabsContent value="curriculum" className="mt-6">
              <div className="space-y-6">
                {classItem.modules.map((module, moduleIndex) => (
                  <Card key={moduleIndex}>
                    <CardHeader>
                      <CardTitle>{module.title}</CardTitle>
                      <CardDescription>{module.lessons.length} lessons</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lessonIndex}
                            className={`flex items-center justify-between p-3 rounded-md ${
                              lesson.completed ? "bg-muted/50" : "bg-muted"
                            } ${nextLesson.lesson === lesson.title ? "border border-primary" : ""}`}
                          >
                            <div className="flex items-center">
                              {lesson.completed ? (
                                <CheckCircle2 className="h-5 w-5 mr-3 text-green-500" />
                              ) : lesson.type === "video" ? (
                                <Video className="h-5 w-5 mr-3 text-blue-500" />
                              ) : (
                                <FileText className="h-5 w-5 mr-3 text-orange-500" />
                              )}
                              <div>
                                <p className="font-medium">{lesson.title}</p>
                                <p className="text-xs text-muted-foreground flex items-center mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {lesson.duration}
                                </p>
                              </div>
                            </div>
                            <Button size="sm" variant={lesson.completed ? "outline" : "default"}>
                              {lesson.completed ? "Review" : "Start"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="resources" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Resources</CardTitle>
                  <CardDescription>Download materials to help with your studies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {classItem.resources.map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-3 text-blue-500" />
                          <div>
                            <p className="font-medium">{resource.title}</p>
                            <p className="text-xs text-muted-foreground">{resource.size}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discussion" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Class Discussion</CardTitle>
                  <CardDescription>Connect with your instructor and classmates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Join the conversation</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Ask questions and share insights with your peers
                    </p>
                    <Button className="mt-4">Start Discussion</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
              <CardDescription>Track your learning journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Overall Progress</span>
                  <span>{classItem.progress}%</span>
                </div>
                <Progress value={classItem.progress} className="h-2" />
              </div>

              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center">
                  <Play className="h-4 w-4 mr-2 text-primary" />
                  <h4 className="text-sm font-medium">Continue Learning</h4>
                </div>
                <p className="mt-1 text-sm">{nextLesson.module}</p>
                <p className="mt-1 text-sm font-medium">{nextLesson.lesson}</p>
                <Button className="w-full mt-4">Resume</Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Instructor</span>
                  </div>
                  <span className="text-sm font-medium">{classItem.instructor}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <span className="text-sm font-medium">{classItem.duration}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Students</span>
                  </div>
                  <span className="text-sm font-medium">{classItem.students.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-2 text-amber-500" />
                    <span className="text-sm">Rating</span>
                  </div>
                  <span className="text-sm font-medium">{classItem.rating}/5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
