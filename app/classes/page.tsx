import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { BookOpen, Calendar, Clock } from "lucide-react"

// Sample enrolled classes data
const enrolledClasses = [
  {
    id: "ap-biology",
    title: "AP Biology",
    description: "Advanced placement biology for college credit",
    instructor: "Dr. Jane Smith",
    progress: 65,
    nextLesson: "Cellular Respiration",
    nextLessonDate: "Today, 3:00 PM",
    image: "/placeholder.svg?height=200&width=400&query=ap+biology",
    category: "Biology",
    categoryColor: "bg-green-100 text-green-700",
  },
  {
    id: "chemistry",
    title: "Chemistry",
    description: "Fundamentals of chemistry and chemical reactions",
    instructor: "Prof. Robert Chen",
    progress: 42,
    nextLesson: "Chemical Bonding",
    nextLessonDate: "Tomorrow, 10:00 AM",
    image: "/colorful-chemistry-lab.png",
    category: "Chemistry",
    categoryColor: "bg-purple-100 text-purple-700",
  },
  {
    id: "environmental-science",
    title: "Environmental Science",
    description: "Study of environmental systems and human impacts",
    instructor: "Dr. Emily Johnson",
    progress: 78,
    nextLesson: "Ecosystem Dynamics",
    nextLessonDate: "Wednesday, 2:00 PM",
    image: "/interconnected-ecosystems.png",
    category: "Environmental Science",
    categoryColor: "bg-teal-100 text-teal-700",
  },
]

// Sample recommended classes
const recommendedClasses = [
  {
    id: "marine-biology",
    title: "Marine Biology",
    description: "Exploration of ocean ecosystems and marine life",
    instructor: "Prof. Michael Johnson",
    level: "Intermediate",
    duration: "10 weeks",
    category: "Biology",
    categoryColor: "bg-blue-100 text-blue-700",
    image: "/placeholder.svg?height=200&width=400&query=marine+biology",
  },
  {
    id: "physics-mechanics",
    title: "Physics: Mechanics",
    description: "Principles of motion, forces, and energy",
    instructor: "Dr. Lisa Wong",
    level: "Beginner",
    duration: "8 weeks",
    category: "Physics",
    categoryColor: "bg-indigo-100 text-indigo-700",
    image: "/placeholder.svg?height=200&width=400&query=physics+mechanics",
  },
  {
    id: "world-history",
    title: "World History",
    description: "Major civilizations and historical events",
    instructor: "Prof. David Miller",
    level: "Beginner",
    duration: "12 weeks",
    category: "History",
    categoryColor: "bg-orange-100 text-orange-700",
    image: "/placeholder.svg?height=200&width=400&query=world+history",
  },
]

export default function ClassesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-muted-foreground">Track your progress and discover new learning opportunities.</p>
      </div>

      <Tabs defaultValue="enrolled" className="mb-8">
        <TabsList className="mb-6 w-full justify-start rounded-lg bg-muted p-1">
          <TabsTrigger value="enrolled" className="rounded-md">
            Enrolled
          </TabsTrigger>
          <TabsTrigger value="recommended" className="rounded-md">
            Recommended
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-md">
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrolledClasses.map((classItem) => (
              <div key={classItem.id} className="course-card overflow-hidden">
                <div className="relative">
                  <img
                    src={classItem.image || "/placeholder.svg"}
                    alt={classItem.title}
                    className="h-48 w-full object-cover"
                  />
                  <Badge className={`absolute left-2 top-2 ${classItem.categoryColor}`}>{classItem.category}</Badge>
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-lg font-bold">{classItem.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">{classItem.instructor}</p>

                  <div className="mb-4">
                    <div className="mb-1 flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">{classItem.progress}%</span>
                    </div>
                    <Progress value={classItem.progress} className="h-2" />
                  </div>

                  <div className="mb-4 rounded-lg bg-muted p-3">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-primary" />
                      <h4 className="text-sm font-medium">Next Lesson</h4>
                    </div>
                    <p className="mt-1 text-sm">{classItem.nextLesson}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{classItem.nextLessonDate}</p>
                  </div>

                  <Button asChild className="w-full">
                    <Link href={`/classes/${classItem.id}`}>Continue</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommended" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recommendedClasses.map((classItem) => (
              <div key={classItem.id} className="course-card overflow-hidden">
                <div className="relative">
                  <img
                    src={classItem.image || "/placeholder.svg"}
                    alt={classItem.title}
                    className="h-48 w-full object-cover"
                  />
                  <Badge className={`absolute left-2 top-2 ${classItem.categoryColor}`}>{classItem.category}</Badge>
                </div>
                <div className="p-6">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-bold">{classItem.title}</h3>
                    <Badge variant="outline">{classItem.level}</Badge>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">{classItem.description}</p>
                  <div className="mb-4 flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                      <span>{classItem.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="mr-1 h-4 w-4 text-muted-foreground" />
                      <span>{classItem.instructor}</span>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/classes/${classItem.id}`}>Enroll Now</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="rounded-xl border border-dashed p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No completed courses yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Continue learning to complete your enrolled courses.</p>
            <Button asChild className="mt-6">
              <Link href="/classes">Continue Learning</Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
