"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { FileText, MessageSquare, ThumbsDown, ThumbsUp, VideoIcon, CheckCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { Lesson, Resource } from "@/lib/courses-data"

interface LessonViewerProps {
  lesson: Lesson
  onComplete: () => void
  onSubmitQuiz?: (score: number) => void
  onSubmitAssignment?: (content: string, attachments?: string[]) => void
  isCompleted?: boolean
}

export function LessonViewerEnhanced({
  lesson,
  onComplete,
  onSubmitQuiz,
  onSubmitAssignment,
  isCompleted = false,
}: LessonViewerProps) {
  const [activeTab, setActiveTab] = useState<string>("content")
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [assignmentText, setAssignmentText] = useState("")
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState("")
  const [videoProgress, setVideoProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Track content viewing progress
  useEffect(() => {
    if (lesson.type === "reading" && contentRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
              // If user has viewed more than 80% of content, enable completion
              const viewableHeight = entry.intersectionRect.height
              const totalHeight = entry.boundingClientRect.height
              if (viewableHeight / totalHeight > 0.8) {
                setVideoProgress(100)
              }
            }
          })
        },
        { threshold: [0, 0.2, 0.5, 0.8, 1] },
      )

      observer.observe(contentRef.current)
      return () => observer.disconnect()
    }
  }, [lesson.type])

  // Handle video progress tracking
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setVideoProgress(progress)
    }
  }

  // Mock quiz questions for demonstration
  const quizQuestions = lesson.quiz?.questions || [
    {
      id: "q1",
      question: "What is the main function of mitochondria?",
      options: ["Cell division", "Energy production", "Protein synthesis", "Waste removal"],
      correctAnswer: "Energy production",
    },
    {
      id: "q2",
      question: "Which of the following is NOT a part of the cell nucleus?",
      options: ["Nucleolus", "Chromatin", "Mitochondria", "Nuclear membrane"],
      correctAnswer: "Mitochondria",
    },
    {
      id: "q3",
      question: "What process do plants use to make their own food?",
      options: ["Respiration", "Photosynthesis", "Fermentation", "Digestion"],
      correctAnswer: "Photosynthesis",
    },
  ]

  const handleQuizSubmit = () => {
    setIsSubmitting(true)

    // Calculate score based on correct answers
    let correctCount = 0
    quizQuestions.forEach((question) => {
      if (quizAnswers[question.id] === question.correctAnswer) {
        correctCount++
      }
    })

    const score = Math.round((correctCount / quizQuestions.length) * 100)

    // Simulate API call
    setTimeout(() => {
      if (onSubmitQuiz) {
        onSubmitQuiz(score)
      }

      toast({
        title: "Quiz Submitted",
        description: `You scored ${score}% on this quiz.`,
      })

      onComplete()
      setIsSubmitting(false)
    }, 1000)
  }

  const handleAssignmentSubmit = () => {
    if (!assignmentText.trim()) {
      toast({
        title: "Error",
        description: "Please enter your assignment submission.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      if (onSubmitAssignment) {
        onSubmitAssignment(assignmentText)
      }

      toast({
        title: "Assignment Submitted",
        description: "Your assignment has been submitted successfully.",
      })

      onComplete()
      setIsSubmitting(false)
    }, 1000)
  }

  const handleSaveNotes = () => {
    // Simulate saving notes
    toast({
      title: "Notes Saved",
      description: "Your notes have been saved successfully.",
    })
  }

  const ResourceItem = ({ resource }: { resource: Resource }) => (
    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
      <div className="flex items-center">
        <FileText className="h-5 w-5 mr-3 text-blue-500" />
        <div>
          <p className="font-medium">{resource.title}</p>
          <p className="text-xs text-muted-foreground">{resource.description}</p>
          {resource.size && <p className="text-xs text-muted-foreground">{resource.size}</p>}
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          // Simulate download
          toast({
            title: "Download Started",
            description: `Downloading ${resource.title}...`,
          })
        }}
      >
        Download
      </Button>
    </div>
  )

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {lesson.type === "video" && (
            <div className="aspect-video bg-black flex items-center justify-center">
              {lesson.videoUrl ? (
                <div className="w-full h-full">
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    controls
                    onTimeUpdate={handleTimeUpdate}
                    poster="/abstract-thumbnail.png"
                  >
                    <source src={lesson.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="text-center text-white">
                  <VideoIcon className="h-16 w-16 mx-auto mb-2" />
                  <p>Video content would appear here</p>
                </div>
              )}
            </div>
          )}

          {videoProgress > 0 && lesson.type === "video" && (
            <div className="px-6 py-2 bg-muted">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{Math.round(videoProgress)}%</span>
              </div>
              <Progress value={videoProgress} className="h-2" />
            </div>
          )}

          <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b">
              <TabsList className="mx-4 my-2">
                <TabsTrigger value="content">Content</TabsTrigger>
                {lesson.resources && lesson.resources.length > 0 && (
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                )}
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
                <TabsTrigger value="notes" onClick={() => setShowNotes(true)}>
                  Notes
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="content" className="p-6">
              {lesson.type === "reading" && lesson.content && (
                <div className="prose prose-sm max-w-none" ref={contentRef}>
                  <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                </div>
              )}

              {lesson.type === "quiz" && (
                <div>
                  <div className="flex items-center mb-4">
                    <FileText className="h-6 w-6 mr-2 text-orange-500" />
                    <h2 className="text-xl font-bold">Quiz: {lesson.quiz?.title}</h2>
                  </div>
                  <p className="mb-6">{lesson.quiz?.description}</p>

                  <div className="space-y-6 mb-6">
                    {quizQuestions.map((q, index) => (
                      <div key={q.id} className="border rounded-lg p-4">
                        <h3 className="font-medium mb-3">
                          Question {index + 1}: {q.question}
                        </h3>
                        <div className="space-y-2">
                          {q.options.map((option, i) => (
                            <div key={i} className="flex items-center">
                              <input
                                type="radio"
                                id={`${q.id}_${i}`}
                                name={q.id}
                                className="mr-2"
                                onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: option })}
                                checked={quizAnswers[q.id] === option}
                                disabled={isCompleted}
                              />
                              <label htmlFor={`${q.id}_${i}`}>{option}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {!isCompleted && (
                    <Button
                      onClick={handleQuizSubmit}
                      className="w-full"
                      disabled={Object.keys(quizAnswers).length < quizQuestions.length || isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Quiz"}
                    </Button>
                  )}

                  {isCompleted && (
                    <div className="flex items-center justify-center p-4 bg-green-50 text-green-700 rounded-md">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      <span>You have completed this quiz</span>
                    </div>
                  )}
                </div>
              )}

              {lesson.type === "assignment" && (
                <div>
                  <div className="flex items-center mb-4">
                    <FileText className="h-6 w-6 mr-2 text-purple-500" />
                    <h2 className="text-xl font-bold">Assignment: {lesson.assignment?.title}</h2>
                  </div>
                  <p className="mb-4">{lesson.assignment?.description}</p>

                  <div className="bg-muted p-4 rounded-md mb-6">
                    <p className="font-medium">Assignment Details:</p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {lesson.assignment?.dueDate && (
                        <li>Due Date: {new Date(lesson.assignment.dueDate).toLocaleDateString()}</li>
                      )}
                      <li>Points: {lesson.assignment?.points}</li>
                    </ul>
                  </div>

                  {!isCompleted ? (
                    <>
                      <div className="mb-6">
                        <label className="block mb-2 font-medium">Your Submission</label>
                        <Textarea
                          placeholder="Type your assignment submission here..."
                          className="min-h-[200px]"
                          value={assignmentText}
                          onChange={(e) => setAssignmentText(e.target.value)}
                        />
                      </div>

                      <Button onClick={handleAssignmentSubmit} className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Assignment"}
                      </Button>
                    </>
                  ) : (
                    <div className="flex items-center justify-center p-4 bg-green-50 text-green-700 rounded-md">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      <span>You have submitted this assignment</span>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {lesson.resources && lesson.resources.length > 0 && (
              <TabsContent value="resources" className="p-6">
                <h3 className="font-medium mb-4">Lesson Resources</h3>
                <div className="space-y-3">
                  {lesson.resources.map((resource) => (
                    <ResourceItem key={resource.id} resource={resource} />
                  ))}
                </div>
              </TabsContent>
            )}

            <TabsContent value="discussion" className="p-6">
              <div className="flex items-center mb-4">
                <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-medium">Lesson Discussion</h3>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium">JD</span>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="font-medium text-sm">John Doe</p>
                        <span className="text-xs text-muted-foreground ml-2">2 days ago</span>
                      </div>
                      <p className="text-sm mt-1">
                        This lesson was really helpful! I especially liked the explanation about cell division.
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <button className="text-xs flex items-center text-muted-foreground hover:text-foreground">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          <span>12</span>
                        </button>
                        <button className="text-xs flex items-center text-muted-foreground hover:text-foreground">
                          <ThumbsDown className="h-3 w-3 mr-1" />
                          <span>2</span>
                        </button>
                        <button className="text-xs text-primary">Reply</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium">AS</span>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="font-medium text-sm">Alice Smith</p>
                        <span className="text-xs text-muted-foreground ml-2">1 day ago</span>
                      </div>
                      <p className="text-sm mt-1">
                        I'm having trouble understanding the difference between mitosis and meiosis. Can someone
                        explain?
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <button className="text-xs flex items-center text-muted-foreground hover:text-foreground">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          <span>5</span>
                        </button>
                        <button className="text-xs flex items-center text-muted-foreground hover:text-foreground">
                          <ThumbsDown className="h-3 w-3 mr-1" />
                          <span>0</span>
                        </button>
                        <button className="text-xs text-primary">Reply</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Add a comment</label>
                <Textarea placeholder="Share your thoughts or questions..." className="mb-2" />
                <Button size="sm">Post Comment</Button>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="p-6">
              <div className="flex items-center mb-4">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-medium">Your Notes</h3>
              </div>

              <Textarea
                placeholder="Take notes while watching or reading..."
                className="min-h-[300px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <div className="flex justify-end mt-4">
                <Button size="sm" onClick={handleSaveNotes}>
                  Save Notes
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {(lesson.type === "video" || lesson.type === "reading") && !isCompleted && (
        <div className="flex justify-end">
          <Button onClick={onComplete} disabled={videoProgress < 80 && lesson.type === "video"}>
            Mark as Completed
          </Button>
        </div>
      )}

      {isCompleted && (
        <div className="flex items-center justify-center p-4 bg-green-50 text-green-700 rounded-md">
          <CheckCircle className="mr-2 h-5 w-5" />
          <span>You have completed this lesson</span>
        </div>
      )}
    </div>
  )
}
