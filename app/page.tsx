import { MasterinSidebar } from "@/components/masterin-sidebar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, GraduationCap, Users, Brain, BarChart3, Globe } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <MasterinSidebar />
      <div className="flex-1">
        <div className="container mx-auto py-8">
          <div className="mb-12 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 p-8">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Welcome to <span className="text-primary">Masterin.org</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Your comprehensive educational platform for middle and high school students
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/explore">Explore Courses</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6">Platform Features</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            <Card>
              <CardHeader>
                <div className="mb-2 h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Comprehensive Courses</CardTitle>
                <CardDescription>Access a wide range of subjects with structured curriculum</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Explore courses in mathematics, science, history, language arts, and more, all designed specifically
                  for middle and high school students.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>AI-Powered Tutoring</CardTitle>
                <CardDescription>Get personalized help with our AI tutor</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Receive instant help and explanations from our advanced AI tutor that adapts to your learning style
                  and needs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>Monitor your learning journey with detailed analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track your progress, identify strengths and areas for improvement, and set goals for your educational
                  journey.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Community Learning</CardTitle>
                <CardDescription>Connect with peers and educators</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Join discussion forums, participate in group projects, and collaborate with students from around the
                  world.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-amber-600" />
                </div>
                <CardTitle>Certification</CardTitle>
                <CardDescription>Earn certificates for completed courses</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Showcase your achievements with certificates that validate your knowledge and skills in various
                  subjects.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Accessible Learning</CardTitle>
                <CardDescription>Learn anytime, anywhere, on any device</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access your courses on desktop, tablet, or mobile with our responsive platform designed for learning
                  on the go.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Ready to start learning?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of students already enhancing their education with Masterin.org
            </p>
            <Button asChild size="lg">
              <Link href="/explore">Browse Courses</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
