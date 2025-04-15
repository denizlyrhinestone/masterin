"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileText, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import type { Assignment } from "@/lib/ai-service"

export default function AIAssignmentsPage() {
  const router = useRouter()
  const { user, status } = useAuth()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("create")
  const [subject, setSubject] = useState("")
  const [topic, setTopic] = useState("")
  const [difficultyLevel, setDifficultyLevel] = useState("intermediate")
  const [additionalRequirements, setAdditionalRequirements] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAssignment, setGeneratedAssignment] = useState<Assignment | null>(null)
  const [savedAssignments, setSavedAssignments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth?redirect=/ai-assignments")
    return null
  }

  // Fetch saved assignments
  const fetchAssignments = async () => {
    if (status !== "authenticated") return

    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/assignments")
      if (!response.ok) throw new Error("Failed to fetch assignments")

      const data = await response.json()
      setSavedAssignments(data)
    } catch (error) {
      console.error("Error fetching assignments:", error)
      toast({
        title: "Error",
        description: "Failed to load your saved assignments",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Generate assignment
  const generateAssignment = async () => {
    if (!subject || !topic) {
      toast({
        title: "Missing information",
        description: "Please provide both subject and topic",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedAssignment(null)

    try {
      const response = await fetch("/api/ai/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          topic,
          difficultyLevel,
          additionalRequirements: additionalRequirements || undefined,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate assignment")

      const data = await response.json()
      setGeneratedAssignment(data.assignment)

      toast({
        title: "Success",
        description: "Assignment generated successfully",
      })

      // Switch to the preview tab
      setActiveTab("preview")
    } catch (error) {
      console.error("Error generating assignment:", error)
      toast({
        title: "Error",
        description: "Failed to generate assignment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Load assignments when viewing saved tab
  if (activeTab === "saved" && savedAssignments.length === 0 && !isLoading) {
    fetchAssignments()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">AI Assignment Generator</h1>
          <p className="text-muted-foreground">Create custom educational assignments for any subject</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/ai-dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Assignment</CardTitle>
              <CardDescription>
                Generate a custom assignment by providing the subject, topic, and difficulty level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Mathematics, Physics, History"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Algebra, Quantum Mechanics, World War II"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Select difficulty level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Additional Requirements (Optional)</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Specify any additional requirements or constraints for the assignment..."
                    className="min-h-[150px]"
                    value={additionalRequirements}
                    onChange={(e) => setAdditionalRequirements(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    You can specify assignment type, time constraints, specific topics to include, etc.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={generateAssignment} disabled={isGenerating} className="w-full md:w-auto">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>Generate Assignment</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          {generatedAssignment ? (
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>{generatedAssignment.title}</CardTitle>
                    <CardDescription>
                      {subject} • {topic} • {difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)}
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setActiveTab("create")}>
                    Create Another
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Description</h3>
                  <p>{generatedAssignment.description}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Learning Objectives</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {generatedAssignment.learningObjectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Instructions</h3>
                  <div className="whitespace-pre-wrap">{generatedAssignment.instructions}</div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Tasks</h3>
                  <div className="space-y-4">
                    {generatedAssignment.tasks.map((task, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div className="font-medium">Task {index + 1}</div>
                          <Badge variant="outline">{task.points} points</Badge>
                        </div>
                        <p className="mt-2">{task.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {generatedAssignment.resources && generatedAssignment.resources.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Resources</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {generatedAssignment.resources.map((resource, index) => (
                        <li key={index}>{resource}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {generatedAssignment.gradingCriteria && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Grading Criteria</h3>
                    <div className="whitespace-pre-wrap">{generatedAssignment.gradingCriteria}</div>
                  </div>
                )}

                {generatedAssignment.estimatedTime && (
                  <div className="mt-4 flex items-center text-muted-foreground">
                    <span>Estimated completion time: {generatedAssignment.estimatedTime}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-4">
                <Button className="w-full sm:w-auto">Save Assignment</Button>
                <Button variant="outline" className="w-full sm:w-auto">
                  Print / Export PDF
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Assignment Generated</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Generate an assignment first to preview it here
                </p>
                <Button onClick={() => setActiveTab("create")}>Create Assignment</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Assignments</CardTitle>
              <CardDescription>View and manage your saved assignments</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : savedAssignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Saved Assignments</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't saved any assignments yet. Generate and save an assignment to see it here.
                  </p>
                  <Button onClick={() => setActiveTab("create")}>Create Assignment</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedAssignments.map((assignment) => (
                    <div key={assignment.id} className="border rounded-md p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <h3 className="font-medium">{assignment.title}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge variant="outline">{assignment.subject}</Badge>
                            <Badge variant="outline">{assignment.topic}</Badge>
                            <Badge variant="outline">
                              {assignment.difficulty.charAt(0).toUpperCase() + assignment.difficulty.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Created on {new Date(assignment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-2 md:mt-0">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
