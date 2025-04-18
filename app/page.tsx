import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Clock, Star, Trophy } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-primary/10 via-blue-50 to-secondary/10 p-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Welcome to <span className="text-primary">Masterin</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-6">Your personalized learning journey starts here.</p>
        <div className="flex flex-wrap gap-4">
          <Button asChild size="lg">
            <Link href="/my-courses">Continue Learning</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/categories">Explore Categories</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <BookOpen className="h-8 w-8 text-primary mb-2" />
            <span className="text-3xl font-bold">5</span>
            <span className="text-sm text-muted-foreground">Enrolled Courses</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <Clock className="h-8 w-8 text-primary mb-2" />
            <span className="text-3xl font-bold">12.5 hrs</span>
            <span className="text-sm text-muted-foreground">Learning Time</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <Trophy className="h-8 w-8 text-primary mb-2" />
            <span className="text-3xl font-bold">15</span>
            <span className="text-sm text-muted-foreground">Completed Lessons</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <Star className="h-8 w-8 text-primary mb-2" />
            <span className="text-3xl font-bold">85%</span>
            <span className="text-sm text-muted-foreground">Average Score</span>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-6">Continue Learning</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="overflow-hidden">
          <div className="relative">
            <img src="/diverse-cell-landscape.png" alt="AP Biology" className="h-48 w-full object-cover" />
            <Badge className="absolute right-2 top-2 bg-blue-500 text-white">AP Course</Badge>
          </div>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-2">AP Biology</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Cellular processes, genetics, evolution, and biological systems.
            </p>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>85% Complete</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <Button className="w-full">Continue</Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="relative">
            <img src="/busy-chemistry-lab.png" alt="Chemistry" className="h-48 w-full object-cover" />
          </div>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-2">Chemistry</h3>
            <p className="text-sm text-muted-foreground mb-4">Atomic structure, chemical bonding, and reactions.</p>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>42% Complete</span>
              </div>
              <Progress value={42} className="h-2" />
            </div>
            <Button className="w-full">Continue</Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="relative">
            <img src="/golden-marsh-twilight.png" alt="Environmental Science" className="h-48 w-full object-cover" />
          </div>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-2">Environmental Science</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ecosystems, biodiversity, and environmental challenges.
            </p>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>78% Complete</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <Button className="w-full">Continue</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
