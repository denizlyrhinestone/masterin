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
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, PenTool, ArrowLeft, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import type { Quiz, QuizQuestion } from "@/lib/ai-service"

export default function AIQuizzesPage() {
  const router = useRouter()
  const { user, status } = useAuth()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("create")
  const [subject, setSubject] = useState("")
  const [topic, setTopic] = useState("")
  const [numberOfQuestions, setNumberOfQuestions] = useState("5")
  const [difficultyLevel, setDifficultyLevel] = useState("intermediate")
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>(["multiple-choice", "true-false"])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null)
  const [savedQuizzes, setSavedQuizzes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentQuizAttempt, setCurrentQuizAttempt] = useState<{
    quizId: string
    answers: Record<number, any>
    currentQuestion: number
    timeRemaining?: number
  } | null>(null)

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth?redirect=/ai-quizzes")
    return null
  }

  // Fetch saved quizzes
  const fetchQuizzes = async () => {
    if (status !== "authenticated") return

    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/quizzes")
      if (!response.ok) throw new Error("Failed to fetch quizzes")

      const data = await response.json()
      setSavedQuizzes(data)
    } catch (error) {
      console.error("Error fetching quizzes:", error)
      toast({
        title: "Error",
        description: "Failed to load your saved quizzes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Generate quiz
  const generateQuiz = async () => {
    if (!subject || !topic || !numberOfQuestions) {
      toast({
        title: "Missing information",
        description: "Please provide subject, topic, and number of questions",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedQuiz(null)

    try {
      const response = await fetch("/api/ai/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          topic,
          numberOfQuestions: Number.parseInt(numberOfQuestions),
          difficultyLevel,
          questionTypes: selectedQuestionTypes,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate quiz")

      const data = await response.json()
      setGeneratedQuiz(data.quiz)

      toast({
        title: "Success",
        description: "Quiz generated successfully",
      })

      // Switch to the preview tab
      setActiveTab("preview")
    } catch (error) {
      console.error("Error generating quiz:", error)
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Start quiz attempt
  const startQuizAttempt = (quizId: string) => {
    setCurrentQuizAttempt({
      quizId,
      answers: {},
      currentQuestion: 0,
    })
    setActiveTab("take")
  }

  // Handle question type selection
  const handleQuestionTypeChange = (type: string) => {
    setSelectedQuestionTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type)
      } else {
        return [...prev, type]
      }
    })
  }

  // Load quizzes when viewing saved tab
  if (activeTab === "saved" && savedQuizzes.length === 0 && !isLoading) {
    fetchQuizzes()
  }

  // Render question for quiz taking
  const renderQuestion = (question: QuizQuestion, index: number) => {
    const handleAnswerChange = (value: any) => {
      if (!currentQuizAttempt) return

      setCurrentQuizAttempt({
        ...currentQuizAttempt,
        answers: {
          ...currentQuizAttempt.answers,
          [index]: value,
        },
      })
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Question {index + 1}</h3>
          <Badge variant="outline">{question.points || 1} points</Badge>
        </div>

        <p className="text-base">{question.question}</p>

        {question.type === "multiple-choice" && question.options && (
          <RadioGroup
            value={currentQuizAttempt?.answers[index] || ""}
            onValueChange={(value) => handleAnswerChange(value)}
          >
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <RadioGroupItem value={optionIndex.toString()} id={`q${index}-option-${optionIndex}`} />
                  <Label htmlFor={`q${index}-option-${optionIndex}`}>{option}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )}

        {question.type === "true-false" && (
          <RadioGroup
            value={currentQuizAttempt?.answers[index] || ""}
            onValueChange={(value) => handleAnswerChange(value)}
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id={`q${index}-true`} />
                <Label htmlFor={`q${index}-true`}>True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id={`q${index}-false`} />
                <Label htmlFor={`q${index}-false`}>False</Label>
              </div>
            </div>
          </RadioGroup>
        )}

        {question.type === "short-answer" && (
          <Textarea
            placeholder="Enter your answer here..."
            value={currentQuizAttempt?.answers[index] || ""}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="min-h-[100px]"
          />
        )}

        {question.type === "essay" && (
          <Textarea
            placeholder="Write your essay here..."
            value={currentQuizAttempt?.answers[index] || ""}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="min-h-[200px]"
          />
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">AI Quiz Generator</h1>
          <p className="text-muted-foreground">Create custom quizzes to test knowledge and track progress</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/ai-dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
          <TabsTrigger value="take">Take Quiz</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Quiz</CardTitle>
              <CardDescription>
                Generate a custom quiz by providing the subject, topic, and other parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="questions">Number of Questions</Label>
                      <Select value={numberOfQuestions} onValueChange={setNumberOfQuestions}>
                        <SelectTrigger id="questions">
                          <SelectValue placeholder="Select number" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 Questions</SelectItem>
                          <SelectItem value="5">5 Questions</SelectItem>
                          <SelectItem value="10">10 Questions</SelectItem>
                          <SelectItem value="15">15 Questions</SelectItem>
                          <SelectItem value="20">20 Questions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty Level</Label>
                      <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                        <SelectTrigger id="difficulty">
                          <SelectValue placeholder="Select difficulty" />
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
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Question Types</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="multiple-choice"
                          checked={selectedQuestionTypes.includes("multiple-choice")}
                          onCheckedChange={() => handleQuestionTypeChange("multiple-choice")}
                        />
                        <Label htmlFor="multiple-choice">Multiple Choice</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="true-false"
                          checked={selectedQuestionTypes.includes("true-false")}
                          onCheckedChange={() => handleQuestionTypeChange("true-false")}
                        />
                        <Label htmlFor="true-false">True/False</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="short-answer"
                          checked={selectedQuestionTypes.includes("short-answer")}
                          onCheckedChange={() => handleQuestionTypeChange("short-answer")}
                        />
                        <Label htmlFor="short-answer">Short Answer</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="essay"
                          checked={selectedQuestionTypes.includes("essay")}
                          onCheckedChange={() => handleQuestionTypeChange("essay")}
                        />
                        <Label htmlFor="essay">Essay</Label>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Select at least one question type</p>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="content">Additional Content (Optional)</Label>
                    <Textarea
                      id="content"
                      placeholder="Paste text content to base the quiz on..."
                      className="min-h-[120px]"
                    />
                    <p className="text-sm text-muted-foreground">
                      You can paste text content to generate questions based on specific material
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={generateQuiz}
                disabled={isGenerating || selectedQuestionTypes.length === 0}
                className="w-full md:w-auto"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>Generate Quiz</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          {generatedQuiz ? (
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>{generatedQuiz.title}</CardTitle>
                    <CardDescription>
                      {subject} • {topic} • {difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setActiveTab("create")}>
                      Create Another
                    </Button>
                    <Button onClick={() => startQuizAttempt("preview")}>Take Quiz</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Description</h3>
                  <p>{generatedQuiz.description}</p>
                </div>

                {generatedQuiz.timeLimit && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Time Limit: {generatedQuiz.timeLimit}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Questions</h3>
                  <div className="space-y-6">
                    {generatedQuiz.questions.map((question, index) => (
                      <div key={index} className="border rounded-md p-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Question {index + 1}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{question.type}</Badge>
                            <Badge variant="outline">{question.points || 1} points</Badge>
                          </div>
                        </div>
                        <p className="mt-2">{question.question}</p>

                        {question.type === "multiple-choice" && question.options && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm font-medium">Options:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              {question.options.map((option, optionIndex) => (
                                <li key={optionIndex} className="text-sm">
                                  {option}
                                  {question.correctAnswer !== undefined &&
                                    (typeof question.correctAnswer === "number"
                                      ? optionIndex === question.correctAnswer
                                      : option === question.correctAnswer) &&
                                    " ✓"}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {question.type === "true-false" && (
                          <div className="mt-3 text-sm">
                            <span className="font-medium">Correct answer: </span>
                            {question.correctAnswer ? "True" : "False"}
                          </div>
                        )}

                        {(question.type === "short-answer" || question.type === "essay") && question.correctAnswer && (
                          <div className="mt-3 text-sm">
                            <p className="font-medium">Sample answer:</p>
                            <p className="mt-1">{question.correctAnswer}</p>
                          </div>
                        )}

                        {question.explanation && (
                          <div className="mt-3 text-sm">
                            <p className="font-medium">Explanation:</p>
                            <p className="mt-1 text-muted-foreground">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <span className="font-medium">Total Points: </span>
                    <span>{generatedQuiz.totalPoints}</span>
                  </div>
                  <div>
                    <span className="font-medium">Questions: </span>
                    <span>{generatedQuiz.questions.length}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-4">
                <Button className="w-full sm:w-auto">Save Quiz</Button>
                <Button variant="outline" className="w-full sm:w-auto">
                  Print / Export PDF
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <PenTool className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Quiz Generated</h3>
                <p className="text-muted-foreground text-center mb-6">Generate a quiz first to preview it here</p>
                <Button onClick={() => setActiveTab("create")}>Create Quiz</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Quizzes</CardTitle>
              <CardDescription>View and manage your saved quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : savedQuizzes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <PenTool className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Saved Quizzes</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't saved any quizzes yet. Generate and save a quiz to see it here.
                  </p>
                  <Button onClick={() => setActiveTab("create")}>Create Quiz</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedQuizzes.map((quiz) => (
                    <div key={quiz.id} className="border rounded-md p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <h3 className="font-medium">{quiz.title}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge variant="outline">{quiz.subject}</Badge>
                            <Badge variant="outline">{quiz.topic}</Badge>
                            <Badge variant="outline">
                              {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                            </Badge>
                            <Badge variant="outline">{quiz.content.questions.length} questions</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Created on {new Date(quiz.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-2 md:mt-0">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button size="sm" onClick={() => startQuizAttempt(quiz.id)}>
                            Take Quiz
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

        <TabsContent value="take">
          {currentQuizAttempt ? (
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>{generatedQuiz?.title || "Quiz"}</CardTitle>
                    <CardDescription>
                      Question {currentQuizAttempt.currentQuestion + 1} of {generatedQuiz?.questions.length || "?"}
                    </CardDescription>
                  </div>
                  {generatedQuiz?.timeLimit && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Time Remaining: {currentQuizAttempt.timeRemaining || generatedQuiz.timeLimit}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {generatedQuiz &&
                  renderQuestion(
                    generatedQuiz.questions[currentQuizAttempt.currentQuestion],
                    currentQuizAttempt.currentQuestion,
                  )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  disabled={currentQuizAttempt.currentQuestion === 0}
                  onClick={() =>
                    setCurrentQuizAttempt({
                      ...currentQuizAttempt,
                      currentQuestion: currentQuizAttempt.currentQuestion - 1,
                    })
                  }
                >
                  Previous
                </Button>

                {currentQuizAttempt.currentQuestion < (generatedQuiz?.questions.length || 0) - 1 ? (
                  <Button
                    onClick={() =>
                      setCurrentQuizAttempt({
                        ...currentQuizAttempt,
                        currentQuestion: currentQuizAttempt.currentQuestion + 1,
                      })
                    }
                  >
                    Next
                  </Button>
                ) : (
                  <Button>Submit Quiz</Button>
                )}
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <PenTool className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Quiz</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Select a quiz to take from your saved quizzes or generate a new one
                </p>
                <div className="flex gap-4">
                  <Button onClick={() => setActiveTab("create")}>Create Quiz</Button>
                  <Button variant="outline" onClick={() => setActiveTab("saved")}>
                    View Saved Quizzes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
