"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, ArrowLeft, BarChart3, BookOpen, PenTool, FlaskConical, Brain, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

export default function LearningAnalyticsPage() {
  const router = useRouter()
  const { user, status } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [timeRange, setTimeRange] = useState("30days")
  const [analyticsData, setAnalyticsData] = useState<any>({
    overview: null,
    tutor: null,
    assignments: null,
    quizzes: null,
    flashcards: null,
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?redirect=/learning-analytics")
    }
  }, [status, router])

  // Fetch analytics data
  useEffect(() => {
    if (status === "authenticated" && user) {
      const fetchAnalyticsData = async () => {
        setIsLoading(true)
        try {
          // In a real implementation, these would be separate API calls to fetch actual data
          // For now, we'll simulate the data

          // Overview data
          const overviewData = {
            totalSessions: 24,
            totalTimeSpent: 1240, // minutes
            activeDays: 18,
            completedItems: {
              assignments: 8,
              quizzes: 12,
              flashcardDecks: 5,
            },
            subjectDistribution: [
              { subject: "Mathematics", percentage: 35 },
              { subject: "Science", percentage: 25 },
              { subject: "History", percentage: 15 },
              { subject: "Computer Science", percentage: 20 },
              { subject: "Languages", percentage: 5 },
            ],
            recentActivity: [
              { type: "quiz", title: "Algebra Fundamentals", date: "2023-04-12", score: 85 },
              { type: "assignment", title: "World History Essay", date: "2023-04-10", status: "completed" },
              { type: "flashcard", title: "Spanish Vocabulary", date: "2023-04-08", cards: 30 },
              { type: "tutor", title: "Physics Q&A Session", date: "2023-04-05", messages: 15 },
            ],
          }

          // AI Tutor data
          const tutorData = {
            totalSessions: 15,
            totalMessages: 120,
            averageSessionLength: 8, // messages per session
            topSubjects: [
              { subject: "Mathematics", sessions: 6 },
              { subject: "Physics", sessions: 4 },
              { subject: "Computer Science", sessions: 3 },
              { subject: "Chemistry", sessions: 2 },
            ],
            sessionTrend: [
              { date: "2023-03-15", sessions: 1 },
              { date: "2023-03-22", sessions: 2 },
              { date: "2023-03-29", sessions: 3 },
              { date: "2023-04-05", sessions: 4 },
              { date: "2023-04-12", sessions: 5 },
            ],
            recentSessions: [
              {
                id: "session-1",
                title: "Calculus Integration Methods",
                date: "2023-04-12",
                messages: 12,
                subject: "Mathematics",
              },
              {
                id: "session-2",
                title: "Quantum Mechanics Basics",
                date: "2023-04-08",
                messages: 15,
                subject: "Physics",
              },
              {
                id: "session-3",
                title: "Data Structures",
                date: "2023-04-05",
                messages: 10,
                subject: "Computer Science",
              },
            ],
          }

          // Assignments data
          const assignmentsData = {
            totalAssignments: 8,
            completedAssignments: 6,
            inProgressAssignments: 2,
            averageScore: 87,
            subjectDistribution: [
              { subject: "Mathematics", count: 3 },
              { subject: "Science", count: 2 },
              { subject: "History", count: 2 },
              { subject: "Computer Science", count: 1 },
            ],
            recentAssignments: [
              {
                id: "assignment-1",
                title: "Linear Algebra Problem Set",
                date: "2023-04-10",
                status: "completed",
                score: 92,
                subject: "Mathematics",
              },
              {
                id: "assignment-2",
                title: "World War II Analysis",
                date: "2023-04-05",
                status: "completed",
                score: 88,
                subject: "History",
              },
              {
                id: "assignment-3",
                title: "Chemical Reactions Lab Report",
                date: "2023-04-01",
                status: "in-progress",
                subject: "Science",
              },
            ],
          }

          // Quizzes data
          const quizzesData = {
            totalQuizzes: 12,
            completedQuizzes: 12,
            averageScore: 78,
            totalQuestions: 120,
            correctAnswers: 94,
            subjectDistribution: [
              { subject: "Mathematics", count: 4 },
              { subject: "Science", count: 3 },
              { subject: "History", count: 2 },
              { subject: "Computer Science", count: 2 },
              { subject: "Languages", count: 1 },
            ],
            recentQuizzes: [
              {
                id: "quiz-1",
                title: "Algebra Fundamentals",
                date: "2023-04-12",
                score: 85,
                totalQuestions: 10,
                subject: "Mathematics",
              },
              {
                id: "quiz-2",
                title: "Python Programming Basics",
                date: "2023-04-08",
                score: 90,
                totalQuestions: 15,
                subject: "Computer Science",
              },
              {
                id: "quiz-3",
                title: "Cell Biology",
                date: "2023-04-03",
                score: 75,
                totalQuestions: 12,
                subject: "Science",
              },
            ],
          }

          // Flashcards data
          const flashcardsData = {
            totalDecks: 5,
            totalCards: 150,
            studiedCards: 120,
            masteredCards: 85,
            studyTime: 320, // minutes
            subjectDistribution: [
              { subject: "Languages", count: 2 },
              { subject: "Science", count: 1 },
              { subject: "History", count: 1 },
              { subject: "Mathematics", count: 1 },
            ],
            recentDecks: [
              {
                id: "deck-1",
                title: "Spanish Vocabulary",
                date: "2023-04-08",
                cards: 30,
                mastered: 22,
                subject: "Languages",
              },
              {
                id: "deck-2",
                title: "Anatomy Terms",
                date: "2023-04-03",
                cards: 40,
                mastered: 28,
                subject: "Science",
              },
              {
                id: "deck-3",
                title: "Historical Dates",
                date: "2023-03-28",
                cards: 25,
                mastered: 15,
                subject: "History",
              },
            ],
          }

          setAnalyticsData({
            overview: overviewData,
            tutor: tutorData,
            assignments: assignmentsData,
            quizzes: quizzesData,
            flashcards: flashcardsData,
          })
        } catch (error) {
          console.error("Error fetching analytics data:", error)
          toast({
            title: "Error",
            description: "Failed to load analytics data",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }

      fetchAnalyticsData()
    }
  }, [user, status, timeRange, toast])

  // Format minutes to hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Loading your learning analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Learning Analytics</h1>
          <p className="text-muted-foreground">Track your progress and learning patterns across all tools</p>
        </div>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="alltime">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => router.push("/ai-dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden md:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="tutor" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden md:inline">AI Tutor</span>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden md:inline">Assignments</span>
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            <span className="hidden md:inline">Quizzes</span>
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            <span className="hidden md:inline">Flashcards</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {analyticsData.overview && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Summary</CardTitle>
                  <CardDescription>Your overall learning activity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Sessions</p>
                      <p className="text-2xl font-bold">{analyticsData.overview.totalSessions}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Time Spent</p>
                      <p className="text-2xl font-bold">{formatTime(analyticsData.overview.totalTimeSpent)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Active Days</p>
                      <p className="text-2xl font-bold">{analyticsData.overview.activeDays}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Completed Items</p>
                      <p className="text-2xl font-bold">
                        {analyticsData.overview.completedItems.assignments +
                          analyticsData.overview.completedItems.quizzes +
                          analyticsData.overview.completedItems.flashcardDecks}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3">Completed by Type</h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Assignments</span>
                          <span>{analyticsData.overview.completedItems.assignments}</span>
                        </div>
                        <Progress
                          value={
                            (analyticsData.overview.completedItems.assignments /
                              (analyticsData.overview.completedItems.assignments +
                                analyticsData.overview.completedItems.quizzes +
                                analyticsData.overview.completedItems.flashcardDecks)) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Quizzes</span>
                          <span>{analyticsData.overview.completedItems.quizzes}</span>
                        </div>
                        <Progress
                          value={
                            (analyticsData.overview.completedItems.quizzes /
                              (analyticsData.overview.completedItems.assignments +
                                analyticsData.overview.completedItems.quizzes +
                                analyticsData.overview.completedItems.flashcardDecks)) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Flashcard Decks</span>
                          <span>{analyticsData.overview.completedItems.flashcardDecks}</span>
                        </div>
                        <Progress
                          value={
                            (analyticsData.overview.completedItems.flashcardDecks /
                              (analyticsData.overview.completedItems.assignments +
                                analyticsData.overview.completedItems.quizzes +
                                analyticsData.overview.completedItems.flashcardDecks)) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subject Distribution</CardTitle>
                  <CardDescription>Time spent across different subjects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analyticsData.overview.subjectDistribution.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.subject}</span>
                        <span>{item.percentage}%</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest learning activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.overview.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                        <div className="mt-0.5">
                          {activity.type === "quiz" && <PenTool className="h-5 w-5 text-green-500" />}
                          {activity.type === "assignment" && <BookOpen className="h-5 w-5 text-purple-500" />}
                          {activity.type === "flashcard" && <FlaskConical className="h-5 w-5 text-orange-500" />}
                          {activity.type === "tutor" && <Brain className="h-5 w-5 text-blue-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(activity.date)}</p>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {activity.type}
                            </Badge>
                            {activity.score && <span className="text-sm">{activity.score}% score</span>}
                            {activity.status && <span className="text-sm capitalize">{activity.status}</span>}
                            {activity.cards && <span className="text-sm">{activity.cards} cards</span>}
                            {activity.messages && <span className="text-sm">{activity.messages} messages</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Activity
                  </Button>
                </CardFooter>
              </Card>

              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Learning Calendar</CardTitle>
                  <CardDescription>Your learning activity over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-64 bg-slate-50 rounded-md border">
                    <div className="text-center">
                      <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Calendar visualization will appear here</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Showing activity frequency and patterns over time
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="tutor">
          {analyticsData.tutor && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Tutor Usage</CardTitle>
                  <CardDescription>Your interaction with the AI Tutor</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Sessions</p>
                      <p className="text-2xl font-bold">{analyticsData.tutor.totalSessions}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Messages</p>
                      <p className="text-2xl font-bold">{analyticsData.tutor.totalMessages}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-sm text-muted-foreground">Avg. Messages per Session</p>
                      <p className="text-2xl font-bold">{analyticsData.tutor.averageSessionLength}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3">Top Subjects</h4>
                    <div className="space-y-3">
                      {analyticsData.tutor.topSubjects.map((subject, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{subject.subject}</span>
                            <span>{subject.sessions} sessions</span>
                          </div>
                          <Progress
                            value={
                              (subject.sessions /
                                analyticsData.tutor.topSubjects.reduce((acc, curr) => acc + curr.sessions, 0)) *
                              100
                            }
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle>Session Trend</CardTitle>
                  <CardDescription>Your AI Tutor usage over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-64 bg-slate-50 rounded-md border">
                    <div className="text-center">
                      <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Session trend visualization will appear here</p>
                      <p className="text-xs text-muted-foreground mt-1">Showing how your usage has changed over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Recent AI Tutor Sessions</CardTitle>
                  <CardDescription>Your latest conversations with the AI Tutor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.tutor.recentSessions.map((session, index) => (
                      <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                        <div className="mt-0.5">
                          <Brain className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium">{session.title}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(session.date)}</p>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {session.subject}
                            </Badge>
                            <span className="text-sm">{session.messages} messages</span>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <Button variant="outline" size="sm">
                              View Session
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Sessions
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="assignments">
          {analyticsData.assignments && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assignments Overview</CardTitle>
                  <CardDescription>Your progress with assignments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Assignments</p>
                      <p className="text-2xl font-bold">{analyticsData.assignments.totalAssignments}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">{analyticsData.assignments.completedAssignments}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">In Progress</p>
                      <p className="text-2xl font-bold">{analyticsData.assignments.inProgressAssignments}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Average Score</p>
                      <p className="text-2xl font-bold">{analyticsData.assignments.averageScore}%</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3">Completion Status</h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Completed</span>
                          <span>
                            {analyticsData.assignments.completedAssignments} /{" "}
                            {analyticsData.assignments.totalAssignments}
                          </span>
                        </div>
                        <Progress
                          value={
                            (analyticsData.assignments.completedAssignments /
                              analyticsData.assignments.totalAssignments) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subject Distribution</CardTitle>
                  <CardDescription>Assignments by subject</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analyticsData.assignments.subjectDistribution.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.subject}</span>
                        <span>{item.count} assignments</span>
                      </div>
                      <Progress
                        value={
                          (item.count /
                            analyticsData.assignments.subjectDistribution.reduce((acc, curr) => acc + curr.count, 0)) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle>Recent Assignments</CardTitle>
                  <CardDescription>Your latest assignments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.assignments.recentAssignments.map((assignment, index) => (
                      <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                        <div className="mt-0.5">
                          <BookOpen className="h-5 w-5 text-purple-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium">{assignment.title}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(assignment.date)}</p>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {assignment.subject}
                            </Badge>
                            <Badge
                              className={`text-xs ${
                                assignment.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {assignment.status}
                            </Badge>
                            {assignment.score && <span className="text-sm">{assignment.score}%</span>}
                          </div>
                          <div className="mt-3 flex justify-end">
                            <Button variant="outline" size="sm">
                              View Assignment
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Assignments
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="quizzes">
          {analyticsData.quizzes && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quizzes Overview</CardTitle>
                  <CardDescription>Your quiz performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Quizzes</p>
                      <p className="text-2xl font-bold">{analyticsData.quizzes.totalQuizzes}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Average Score</p>
                      <p className="text-2xl font-bold">{analyticsData.quizzes.averageScore}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Questions</p>
                      <p className="text-2xl font-bold">{analyticsData.quizzes.totalQuestions}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Correct Answers</p>
                      <p className="text-2xl font-bold">{analyticsData.quizzes.correctAnswers}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3">Answer Accuracy</h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Correct Answers</span>
                          <span>
                            {analyticsData.quizzes.correctAnswers} / {analyticsData.quizzes.totalQuestions}
                          </span>
                        </div>
                        <Progress
                          value={(analyticsData.quizzes.correctAnswers / analyticsData.quizzes.totalQuestions) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subject Distribution</CardTitle>
                  <CardDescription>Quizzes by subject</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analyticsData.quizzes.subjectDistribution.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.subject}</span>
                        <span>{item.count} quizzes</span>
                      </div>
                      <Progress
                        value={
                          (item.count /
                            analyticsData.quizzes.subjectDistribution.reduce((acc, curr) => acc + curr.count, 0)) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle>Recent Quizzes</CardTitle>
                  <CardDescription>Your latest quiz attempts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.quizzes.recentQuizzes.map((quiz, index) => (
                      <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                        <div className="mt-0.5">
                          <PenTool className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium">{quiz.title}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(quiz.date)}</p>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {quiz.subject}
                            </Badge>
                            <Badge
                              className={`text-xs ${
                                quiz.score >= 80
                                  ? "bg-green-100 text-green-800"
                                  : quiz.score >= 60
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {quiz.score}%
                            </Badge>
                            <span className="text-sm">{quiz.totalQuestions} questions</span>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <Button variant="outline" size="sm">
                              View Results
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Quizzes
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="flashcards">
          {analyticsData.flashcards && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Flashcards Overview</CardTitle>
                  <CardDescription>Your flashcard study progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Decks</p>
                      <p className="text-2xl font-bold">{analyticsData.flashcards.totalDecks}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Cards</p>
                      <p className="text-2xl font-bold">{analyticsData.flashcards.totalCards}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Cards Studied</p>
                      <p className="text-2xl font-bold">{analyticsData.flashcards.studiedCards}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Cards Mastered</p>
                      <p className="text-2xl font-bold">{analyticsData.flashcards.masteredCards}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3">Study Progress</h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Cards Studied</span>
                          <span>
                            {analyticsData.flashcards.studiedCards} / {analyticsData.flashcards.totalCards}
                          </span>
                        </div>
                        <Progress
                          value={(analyticsData.flashcards.studiedCards / analyticsData.flashcards.totalCards) * 100}
                          className="h-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Cards Mastered</span>
                          <span>
                            {analyticsData.flashcards.masteredCards} / {analyticsData.flashcards.totalCards}
                          </span>
                        </div>
                        <Progress
                          value={(analyticsData.flashcards.masteredCards / analyticsData.flashcards.totalCards) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subject Distribution</CardTitle>
                  <CardDescription>Flashcard decks by subject</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analyticsData.flashcards.subjectDistribution.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.subject}</span>
                        <span>{item.count} decks</span>
                      </div>
                      <Progress
                        value={
                          (item.count /
                            analyticsData.flashcards.subjectDistribution.reduce((acc, curr) => acc + curr.count, 0)) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle>Recent Flashcard Decks</CardTitle>
                  <CardDescription>Your latest flashcard study sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.flashcards.recentDecks.map((deck, index) => (
                      <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                        <div className="mt-0.5">
                          <FlaskConical className="h-5 w-5 text-orange-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium">{deck.title}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(deck.date)}</p>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {deck.subject}
                            </Badge>
                            <span className="text-sm">{deck.cards} cards</span>
                            <span className="text-sm text-green-600">{deck.mastered} mastered</span>
                          </div>
                          <div className="mt-2">
                            <Progress value={(deck.mastered / deck.cards) * 100} className="h-2" />
                          </div>
                          <div className="mt-3 flex justify-end">
                            <Button variant="outline" size="sm">
                              Continue Studying
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Decks
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
