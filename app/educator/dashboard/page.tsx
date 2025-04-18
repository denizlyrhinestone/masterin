"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { BookOpen, Info, Plus, Users, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function EducatorDashboardPage() {
  const { profile } = useAuth()
  const [courseStats, setCourseStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    averageRating: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEducatorStats = async () => {
      try {
        // In a real app, this would fetch from an API
        // For now, we'll use mock data
        setCourseStats({
          totalCourses: 5,
          totalStudents: 248,
          averageRating: 4.7,
        })
      } catch (error) {
        console.error("Error fetching educator stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEducatorStats()
  }, [])

  return (
    <ProtectedRoute allowedRoles={["educator"]}>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Educator Dashboard</h1>
          <p className="text-muted-foreground">Manage your courses and track student progress</p>
        </div>

        {!profile?.educator_verified && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Verification Pending</AlertTitle>
            <AlertDescription className="text-amber-700">
              Your educator account is pending verification. Some features may be limited until verification is
              complete.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="flex flex-row items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                <p className="text-3xl font-bold">{courseStats.totalCourses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-row items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold">{courseStats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-row items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-3xl font-bold">{courseStats.averageRating.toFixed(1)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for managing your courses</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Button asChild className="h-auto flex-col py-4 justify-start items-start text-left">
              <Link href="/educator/courses/create">
                <Plus className="h-5 w-5 mb-2" />
                <div>
                  <div className="font-medium">Create New Course</div>
                  <div className="text-xs text-muted-foreground mt-1">Design and publish a new educational course</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col py-4 justify-start items-start text-left">
              <Link href="/educator/courses">
                <BookOpen className="h-5 w-5 mb-2" />
                <div>
                  <div className="font-medium">Manage Courses</div>
                  <div className="text-xs text-muted-foreground mt-1">Edit and update your existing courses</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col py-4 justify-start items-start text-left">
              <Link href="/educator/analytics">
                <BarChart3 className="h-5 w-5 mb-2" />
                <div>
                  <div className="font-medium">View Analytics</div>
                  <div className="text-xs text-muted-foreground mt-1">Track student engagement and performance</div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Your Recent Courses</CardTitle>
            <CardDescription>Courses you've recently created or updated</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
                ))}
              </div>
            ) : courseStats.totalCourses > 0 ? (
              <div className="space-y-2">
                {/* Sample courses - in a real app, these would come from the database */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Introduction to Biology</p>
                      <p className="text-xs text-muted-foreground">Last updated 2 days ago</p>
                    </div>
                  </div>
                  <Badge>Published</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Advanced Chemistry</p>
                      <p className="text-xs text-muted-foreground">Last updated 1 week ago</p>
                    </div>
                  </div>
                  <Badge variant="outline">Draft</Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-6">Create your first course to get started</p>
                <Button asChild>
                  <Link href="/educator/courses/create">Create Course</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
