import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { BookOpen, Clock, Filter, Search, Star, Users } from "lucide-react"
import { courses } from "@/lib/courses-data"

export default function CoursesPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Explore Courses</h1>
        <p className="text-muted-foreground">
          Discover a wide range of subjects tailored for middle and high school students.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search courses..." className="pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="biology">Biology</SelectItem>
              <SelectItem value="chemistry">Chemistry</SelectItem>
              <SelectItem value="environmental-science">Environmental Science</SelectItem>
              <SelectItem value="mathematics">Mathematics</SelectItem>
              <SelectItem value="history">History</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="mb-6 w-full justify-start rounded-lg bg-muted p-1">
          <TabsTrigger value="all" className="rounded-md">
            All Courses
          </TabsTrigger>
          <TabsTrigger value="featured" className="rounded-md">
            Featured
          </TabsTrigger>
          <TabsTrigger value="popular" className="rounded-md">
            Popular
          </TabsTrigger>
          <TabsTrigger value="new" className="rounded-md">
            New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="featured" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses
              .filter((c) => c.featured)
              .map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses
              .filter((c) => c.popular)
              .map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses
              .filter((c) => c.new)
              .map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CourseCard({ course }: { course: (typeof courses)[0] }) {
  return (
    <div className="course-card overflow-hidden">
      <div className="relative">
        <img src={course.thumbnail || "/placeholder.svg"} alt={course.title} className="h-48 w-full object-cover" />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <Badge className="bg-primary text-white">{course.category}</Badge>
          {course.featured && <Badge className="bg-secondary text-white">Featured</Badge>}
        </div>
        {course.enrollmentStatus === "Coming Soon" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Badge className="bg-warning-500 text-white">Coming Soon</Badge>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-bold">{course.title}</h3>
          <Badge variant="outline">{course.level}</Badge>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">{course.description}</p>
        <div className="mb-4 flex items-center justify-between text-sm">
          <div className="flex items-center">
            <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center">
            <Users className="mr-1 h-4 w-4 text-muted-foreground" />
            <span>{course.enrollmentCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center">
            <Star className="mr-1 h-4 w-4 text-amber-500" />
            <span>{course.rating}</span>
          </div>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <BookOpen className="mr-2 h-4 w-4" />
          <span>By {course.instructor.name}</span>
        </div>
        <Button asChild className="w-full">
          <Link href={`/courses/${course.slug}`}>View Course</Link>
        </Button>
      </div>
    </div>
  )
}
