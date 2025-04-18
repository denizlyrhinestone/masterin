import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { BookOpen, Calendar, Clock } from "lucide-react"

// Sample enrolled classes data
const enrolledClasses = [
  {
    id: "algebra-101",
    title: "Algebra 101",
    description: "Introduction to algebraic concepts",
    instructor: "Dr. Jane Smith",
    progress: 65,
    nextLesson: "Quadratic Equations",
    nextLessonDate: "Today, 3:00 PM",
    image: "/placeholder.svg?height=200&width=400&query=algebra",
  },
  {
    id: "physics-mechanics",
    title: "Physics: Mechanics",
    description: "Fundamentals of classical mechanics",
    instructor: "Prof. Robert Chen",
    progress: 42,
    nextLesson: "Newton's Laws of Motion",
    nextLessonDate: "Tomorrow, 10:00 AM",
    image: "/placeholder.svg?height=200&width=400&query=physics",
  },
  {
    id: "literature-analysis",
    title: "Literature Analysis",
    description: "Critical analysis of classic literature",
    instructor: "Dr. Emily Johnson",
    progress: 78,
    nextLesson: "Shakespeare's Sonnets",
    nextLessonDate: "Wednesday, 2:00 PM",
    image: "/placeholder.svg?height=200&width=400&query=literature",
  },
]

// Sample recommended classes
const recommendedClasses = [
  {
    id: "calculus-fundamentals",
    title: "Calculus Fundamentals",
    description: "Learn the basics of differential and integral calculus",
    instructor: "Prof. Michael Johnson",
    level: "Intermediate",
    duration: "10 weeks",
    category: "Mathematics",
    image: "/placeholder.svg?height=200&width=400&query=calculus",
  },
  {
    id: "chemistry-101",
    title: "Chemistry 101",
    description: "Introduction to basic chemistry concepts",
    instructor: "Dr. Lisa Wong",
    level: "Beginner",
    duration: "8 weeks",
    category: "Science",
    image: "/placeholder.svg?height=200&width=400&query=chemistry",
  },
  {
    id: "programming-python",
    title: "Programming with Python",
    description: "Learn Python programming from scratch",
    instructor: "Prof. David Miller",
    level: "Beginner",
    duration: "12 weeks",
    category: "Computer Science",
    image: "/placeholder.svg?height=200&width=400&query=python",
  },
]

export default function ClassesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Classes</h1>
        <p className="text-muted-foreground">Manage your enrolled classes and find new ones to join.</p>
      </div>

      <Tabs defaultValue="enrolled" className="mb-8">
        <TabsList>
          <TabsTrigger value="enrolled">Enrolled Classes</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrolledClasses.map((classItem) => (
              <Card key={classItem.id} className="overflow-hidden">
                <img
                  src={classItem.image || "/placeholder.svg"}
                  alt={classItem.title}
                  className="h-48 w-full object-cover"
                />
                <CardHeader>
                  <CardTitle>{classItem.title}</CardTitle>
                  <CardDescription>{classItem.instructor}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Progress</span>
                      <span>{classItem.progress}%</span>
                    </div>
                    <Progress value={classItem.progress} className="h-2" />
                  </div>

                  <div className="rounded-lg bg-muted p-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <h4 className="text-sm font-medium">Next Lesson</h4>
                    </div>
                    <p className="mt-1 text-sm">{classItem.nextLesson}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{classItem.nextLessonDate}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/classes/${classItem.id}`}>Continue Learning</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommended" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recommendedClasses.map((classItem) => (
              <Card key={classItem.id} className="overflow-hidden">
                <img
                  src={classItem.image || "/placeholder.svg"}
                  alt={classItem.title}
                  className="h-48 w-full object-cover"
                />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{classItem.title}</CardTitle>
                    <Badge>{classItem.level}</Badge>
                  </div>
                  <CardDescription>{classItem.instructor}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{classItem.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                      <span>{classItem.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="mr-1 h-4 w-4 text-muted-foreground" />
                      <span>{classItem.category}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/classes/${classItem.id}`}>Enroll Now</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No completed classes yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Continue learning to complete your enrolled classes.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
