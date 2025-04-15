"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Brain, MessageSquare, FileText, PenTool, FlaskConical } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

interface CourseAIToolsProps {
  courseId: string
  courseTitle: string
  courseSubject: string
  courseTopic: string
  courseContent?: string
}

export function CourseAITools({
  courseId,
  courseTitle,
  courseSubject,
  courseTopic,
  courseContent,
}: CourseAIToolsProps) {
  const router = useRouter()
  const { user, status } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("tutor")
  const [isLoading, setIsLoading] = useState(false)
  const [question, setQuestion] = useState("")
  const [assignmentDifficulty, setAssignmentDifficulty] = useState("intermediate")
  const [quizQuestionCount, setQuizQuestionCount] = useState("5")
  const [flashcardCount, setFlashcardCount] = useState("10")

  // Handle AI Tutor question
  const handleTutorQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Question required",
        description: "Please enter a question to ask the AI tutor",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Create a new AI tutor session with course context
      const response = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
          subject: courseSubject,
          topic: courseTopic,
          courseId: courseId,
          courseContext: courseContent,
        }),
      })

      if (!response.ok) throw new Error("Failed to create AI tutor session")

      const data = await response.json()

      // Redirect to the AI tutor with the new session
      router.push(`/ai-tutor?session=${data.sessionId}`)

      toast({
        title: "AI Tutor session created",
        description: "You'll be redirected to continue your conversation",
      })
    } catch (error) {
      console.error("Error creating AI tutor session:", error)
      toast({
        title: "Error",
        description: "Failed to create AI tutor session. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Generate assignment based on course
  const handleGenerateAssignment = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: courseSubject,
          topic: courseTopic,
          difficultyLevel: assignmentDifficulty,
          courseId: courseId,
          courseContext: courseContent,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate assignment")

      const data = await response.json()

      // Redirect to the assignment page
      router.push(`/ai-assignments?id=${data.assignmentId}`)

      toast({
        title: "Assignment generated",
        description: "Your course-specific assignment has been created",
      })
    } catch (error) {
      console.error("Error generating assignment:", error)
      toast({
        title: "Error",
        description: "Failed to generate assignment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Generate quiz based on course
  const handleGenerateQuiz = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: courseSubject,
          topic: courseTopic,
          numberOfQuestions: Number.parseInt(quizQuestionCount),
          difficultyLevel: "intermediate",
          courseId: courseId,
          courseContext: courseContent,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate quiz")

      const data = await response.json()

      // Redirect to the quiz page
      router.push(`/ai-quizzes?id=${data.quizId}`)

      toast({
        title: "Quiz generated",
        description: "Your course-specific quiz has been created",
      })
    } catch (error) {
      console.error("Error generating quiz:", error)
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Generate flashcards based on course
  const handleGenerateFlashcards = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `${courseTitle} Flashcards`,
          subject: courseSubject,
          topic: courseTopic,
          numberOfCards: Number.parseInt(flashcardCount),
          courseId: courseId,
          courseContext: courseContent,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate flashcards")

      const data = await response.json()

      // Redirect to the flashcards page
      router.push(`/ai-flashcards?id=${data.deckId}`)

      toast({
        title: "Flashcards generated",
        description: "Your course-specific flashcards have been created",
      })
    } catch (error) {
      console.error("Error generating flashcards:", error)
      toast({
        title: "Error",
        description: "Failed to generate flashcards. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          AI Learning Tools
        </CardTitle>
        <CardDescription>Enhance your learning with AI tools specifically tailored to this course</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tutor" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">AI Tutor</span>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Assignments</span>
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              <span className="hidden sm:inline">Quizzes</span>
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              <span className="hidden sm:inline">Flashcards</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tutor" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Ask a question about this course</Label>
              <Textarea
                id="question"
                placeholder="e.g., Can you explain the concept of photosynthesis covered in this lesson?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                The AI tutor has context about this course and can answer specific questions about the material.
              </p>
            </div>
            <Button onClick={handleTutorQuestion} disabled={isLoading || !question.trim()} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating session...
                </>
              ) : (
                <>Ask AI Tutor</>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assignment-difficulty">Assignment Difficulty</Label>
              <Select value={assignmentDifficulty} onValueChange={setAssignmentDifficulty}>
                <SelectTrigger id="assignment-difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Generate a practice assignment based on this course's content.
              </p>
            </div>
            <Button onClick={handleGenerateAssignment} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating assignment...
                </>
              ) : (
                <>Generate Assignment</>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quiz-questions">Number of Questions</Label>
              <Select value={quizQuestionCount} onValueChange={setQuizQuestionCount}>
                <SelectTrigger id="quiz-questions">
                  <SelectValue placeholder="Select number" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                  <SelectItem value="15">15 Questions</SelectItem>
                  <SelectItem value="20">20 Questions</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Create a quiz to test your knowledge of this course material.
              </p>
            </div>
            <Button onClick={handleGenerateQuiz} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating quiz...
                </>
              ) : (
                <>Generate Quiz</>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="flashcards" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="flashcard-count">Number of Flashcards</Label>
              <Select value={flashcardCount} onValueChange={setFlashcardCount}>
                <SelectTrigger id="flashcard-count">
                  <SelectValue placeholder="Select number" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 Cards</SelectItem>
                  <SelectItem value="20">20 Cards</SelectItem>
                  <SelectItem value="30">30 Cards</SelectItem>
                  <SelectItem value="50">50 Cards</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Create flashcards to help memorize key concepts from this course.
              </p>
            </div>
            <Button onClick={handleGenerateFlashcards} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating flashcards...
                </>
              ) : (
                <>Generate Flashcards</>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          All AI tools are customized for <span className="font-medium">{courseTitle}</span>
        </p>
        <Button variant="outline" size="sm" onClick={() => router.push("/ai-dashboard")}>
          <Brain className="mr-2 h-4 w-4" /> All AI Tools
        </Button>
      </CardFooter>
    </Card>
  )
}
