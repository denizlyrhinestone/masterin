import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, BookOpen, Clock, Star, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function Dashboard() {
  return (
    <div className="container mx-auto p-6">
      {/* Hero Section */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 p-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to <span className="gradient-text">Masterin</span>
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">Your personalized learning journey starts here.</p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Button asChild size="lg">
            <Link href="/classes">
              Continue Learning <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/categories">Explore Categories</Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="feature-icon-container bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-xl font-bold">5</h3>
            <p className="text-sm text-muted-foreground">Enrolled Courses</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="feature-icon-container bg-secondary/10">
              <Clock className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="mt-4 text-xl font-bold">12.5 hrs</h3>
            <p className="text-sm text-muted-foreground">Learning Time</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="feature-icon-container bg-accent/10">
              <Star className="h-6 w-6 text-accent" />
            </div>
            <h3 className="mt-4 text-xl font-bold">15</h3>
            <p className="text-sm text-muted-foreground">Completed Lessons</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="feature-icon-container bg-warning/10">
              <TrendingUp className="h-6 w-6 text-warning-500" />
            </div>
            <h3 className="mt-4 text-xl font-bold">85%</h3>
            <p className="text-sm text-muted-foreground">Average Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      <h2 className="mb-4 text-2xl font-bold">Continue Learning</h2>
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="course-card">
          <div className="relative">
            <img src="/microscopic-life.png" alt="AP Biology" className="h-48 w-full object-cover" />
            <Badge className="absolute right-2 top-2 bg-primary text-white">AP Course</Badge>
          </div>
          <CardContent className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-bold">AP Biology</h3>
              <Badge variant="outline">65% Complete</Badge>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Cellular processes, genetics, evolution, and biological systems.
            </p>
            <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[65%] rounded-full bg-primary"></div>
            </div>
            <Button asChild className="w-full">
              <Link href="/classes/ap-biology">Continue</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="course-card">
          <div className="relative">
            <img src="/colorful-chemistry-lab.png" alt="Chemistry" className="h-48 w-full object-cover" />
          </div>
          <CardContent className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-bold">Chemistry</h3>
              <Badge variant="outline">42% Complete</Badge>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">Atomic structure, chemical bonding, and reactions.</p>
            <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[42%] rounded-full bg-primary"></div>
            </div>
            <Button asChild className="w-full">
              <Link href="/classes/chemistry">Continue</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="course-card">
          <div className="relative">
            <img src="/interconnected-ecosystems.png" alt="Environmental Science" className="h-48 w-full object-cover" />
          </div>
          <CardContent className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-bold">Environmental Science</h3>
              <Badge variant="outline">78% Complete</Badge>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Ecosystems, biodiversity, and environmental challenges.
            </p>
            <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[78%] rounded-full bg-primary"></div>
            </div>
            <Button asChild className="w-full">
              <Link href="/classes/environmental-science">Continue</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Featured Categories */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Featured Categories</h2>
        <Button asChild variant="ghost" size="sm">
          <Link href="/categories">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/categories/biology" className="category-card group block p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20">
            <img src="/microscopic-life.png" alt="Biology" className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-bold">Biology</h3>
          <p className="text-sm text-muted-foreground">
            Explore living organisms, their structures, functions, and ecosystems.
          </p>
        </Link>

        <Link href="/categories/mathematics" className="category-card group block p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 group-hover:bg-secondary/20">
            <img src="/abstract-mathematics.png" alt="Mathematics" className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-bold">Mathematics</h3>
          <p className="text-sm text-muted-foreground">Master algebra, calculus, geometry, and statistical concepts.</p>
        </Link>

        <Link href="/categories/history" className="category-card group block p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 group-hover:bg-accent/20">
            <img src="/ancient-civilizations-timeline.png" alt="History" className="h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-bold">History</h3>
          <p className="text-sm text-muted-foreground">
            Discover world civilizations, important events, and cultural developments.
          </p>
        </Link>
      </div>
    </div>
  )
}
