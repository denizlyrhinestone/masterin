"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  Send,
  BookOpen,
  Code,
  Calculator,
  Globe,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  HelpCircle,
  AlertTriangle,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Define the course context type
interface CourseContext {
  title: string
  description: string
  currentTopic: string
  learningObjectives: string[]
}

// Define message type
type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

interface EnhancedAiTutorProps {
  courseContext?: CourseContext
}

export function EnhancedAiTutor({ courseContext }: EnhancedAiTutorProps) {
  const [activeTab, setActiveTab] = useState("general")
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [showHelpDialog, setShowHelpDialog] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isClient, setIsClient] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Custom state management instead of useChat
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your AI learning assistant. I can help you understand concepts, solve problems, and provide learning resources. What would you like to learn today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Only render client-side components after mount
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // Prepare a prompt based on the selected tab
    let prompt = ""
    switch (value) {
      case "programming":
        prompt = "I'd like to learn about programming concepts."
        break
      case "math":
        prompt = "I need help with mathematics."
        break
      case "languages":
        prompt = "I want to practice a new language."
        break
      default:
        return // Don't send a message for general tab
    }

    // Only send if changing to a specific subject tab
    if (value !== "general") {
      sendMessage(prompt)
    }
  }

  // Send message to API
  const sendMessage = async (content: string) => {
    try {
      setIsLoading(true)
      setErrorMessage(null)

      // Add user message to state
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
      }

      setMessages((prev) => [...prev, userMessage])

      // Clear input if this is from the input field
      if (content === input) {
        setInput("")
      }

      // Call API
      const response = await fetch("/api/enhanced-tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          courseContext,
        }),
      })

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const data = await response.json()

      // Add assistant message to state
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: data.content,
        },
      ])
    } catch (error) {
      console.error("AI chat error:", error)
      setErrorMessage("I'm having trouble connecting. Please try again in a moment.")

      toast({
        title: "Connection issue",
        description: "There was a problem connecting to the AI assistant.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    sendMessage(input)
  }

  // Retry last message
  const retry = () => {
    // Find the last user message
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")

    if (lastUserMessage) {
      // Remove the last assistant message if it exists
      const newMessages = messages.filter((m) => m.role !== "assistant" || m.id !== messages[messages.length - 1].id)

      setMessages(newMessages)
      sendMessage(lastUserMessage.content)
    }
  }

  // Generate a suggested question based on the course context
  const getSuggestedQuestion = () => {
    if (!courseContext) return "What is the difference between machine learning and deep learning?"

    const suggestions = [
      `Can you explain the concept of ${courseContext.currentTopic}?`,
      `What are the key principles of ${courseContext.currentTopic}?`,
      `How does ${courseContext.currentTopic} relate to ${courseContext.title}?`,
      `Can you provide an example of ${courseContext.currentTopic} in practice?`,
      `What are common challenges when learning about ${courseContext.currentTopic}?`,
    ]

    return suggestions[Math.floor(Math.random() * suggestions.length)]
  }

  // Insert a suggested question into the input
  const insertSuggestedQuestion = () => {
    setInput(getSuggestedQuestion())
  }

  // Handle feedback submission
  const handleFeedback = (messageId: string, isPositive: boolean) => {
    setFeedbackMessage(messageId)

    if (!isPositive) {
      setShowFeedbackDialog(true)
    } else {
      // Submit positive feedback
      toast({
        title: "Thank you for your feedback",
        description: "We're glad this response was helpful!",
      })

      // In a real app, you would send this feedback to your backend
      console.log("Positive feedback for message:", messageId)
    }
  }

  // Submit detailed feedback
  const submitDetailedFeedback = () => {
    // In a real app, you would send this feedback to your backend
    console.log("Detailed feedback:", {
      messageId: feedbackMessage,
      feedback: feedbackText,
    })

    toast({
      title: "Feedback submitted",
      description: "Thank you for helping us improve our AI tutor.",
    })

    setShowFeedbackDialog(false)
    setFeedbackText("")
    setFeedbackMessage(null)
  }

  // If not client-side yet, return nothing or a loading indicator
  if (!isClient) {
    return (
      <Card className="border-2">
        <CardContent className="p-4 flex items-center justify-center h-[500px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2">
      <Tabs defaultValue="general" onValueChange={handleTabChange}>
        <TabsList className="w-full justify-start p-0 bg-transparent border-b rounded-none">
          <TabsTrigger value="general" className="data-[state=active]:bg-blue-50 rounded-b-none">
            <BookOpen className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="programming" className="data-[state=active]:bg-blue-50 rounded-b-none">
            <Code className="h-4 w-4 mr-2" />
            Programming
          </TabsTrigger>
          <TabsTrigger value="math" className="data-[state=active]:bg-blue-50 rounded-b-none">
            <Calculator className="h-4 w-4 mr-2" />
            Mathematics
          </TabsTrigger>
          <TabsTrigger value="languages" className="data-[state=active]:bg-blue-50 rounded-b-none">
            <Globe className="h-4 w-4 mr-2" />
            Languages
          </TabsTrigger>
        </TabsList>

        <CardContent className="p-0">
          <div className="h-[500px] flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 ${
                    message.role === "user" ? "bg-blue-50 ml-12 rounded-lg p-3" : "bg-gray-100 mr-12 rounded-lg p-3"
                  }`}
                >
                  <div className="font-medium mb-1">{message.role === "user" ? "You" : "AI Tutor"}</div>
                  <div className="text-gray-700 whitespace-pre-wrap">{message.content}</div>

                  {/* Feedback buttons for AI responses */}
                  {message.role === "assistant" && message.id !== "welcome" && (
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span className="mr-2">Was this helpful?</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 rounded-full"
                        onClick={() => handleFeedback(message.id, true)}
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span className="sr-only">Yes</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 rounded-full ml-1"
                        onClick={() => handleFeedback(message.id, false)}
                      >
                        <ThumbsDown className="h-3 w-3" />
                        <span className="sr-only">No</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {errorMessage && (
                <div className="p-3 bg-red-50 text-red-800 rounded-lg mb-4">
                  <div className="font-medium flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Connection Issue
                  </div>
                  <div>
                    {errorMessage}
                    <div className="mt-2">
                      <Button variant="outline" size="sm" onClick={retry}>
                        Try Again
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t">
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <Textarea
                    name="message"
                    placeholder="Ask a question or describe what you want to learn..."
                    value={input}
                    onChange={handleInputChange}
                    className="min-h-[80px] pr-20"
                    disabled={isLoading}
                  />
                  <div className="absolute right-2 top-2 flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={insertSuggestedQuestion}
                      title="Insert a suggested question"
                      disabled={isLoading}
                    >
                      <Lightbulb className="h-4 w-4" />
                      <span className="sr-only">Suggest question</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setShowHelpDialog(true)}
                      title="Get help with using the AI tutor"
                    >
                      <HelpCircle className="h-4 w-4" />
                      <span className="sr-only">Help</span>
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {courseContext && (
                      <span>
                        Context: <strong>{courseContext.currentTopic}</strong>
                      </span>
                    )}
                  </div>
                  <Button type="submit" disabled={isLoading || !input.trim()} className="self-end">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="ml-2">{isLoading ? "Thinking..." : "Send"}</span>
                  </Button>
                </div>
                {isLoading && (
                  <div className="text-xs text-gray-500 flex items-center">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Generating response... This may take a moment.
                  </div>
                )}
              </div>
            </form>
          </div>
        </CardContent>
      </Tabs>

      {/* Feedback Dialog - Only rendered when needed */}
      {showFeedbackDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Help us improve</h2>
            <p className="text-sm text-gray-500 mb-4">
              We're sorry this response wasn't helpful. Please let us know how we can improve.
            </p>
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="What was wrong with this response? How could it be better?"
              className="min-h-[100px] mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
                Cancel
              </Button>
              <Button onClick={submitDetailedFeedback} disabled={!feedbackText.trim()}>
                Submit Feedback
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Help Dialog - Only rendered when needed */}
      {showHelpDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">AI Tutor Help</h2>
            <div className="py-2">
              <h3 className="font-medium mb-2">How to use the AI Tutor</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="font-medium">Ask questions:</span> Type your question and press Send
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">Choose a subject:</span> Use the tabs to focus on a specific subject
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">Get suggestions:</span> Click the lightbulb icon for question ideas
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">Provide feedback:</span> Let us know if responses are helpful
                </li>
              </ul>

              <h3 className="font-medium mt-4 mb-2">Tips for better results</h3>
              <ul className="space-y-2 text-sm">
                <li>Be specific in your questions</li>
                <li>Provide context about what you're studying</li>
                <li>Ask for examples if concepts are unclear</li>
                <li>Request step-by-step explanations for complex topics</li>
              </ul>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setShowHelpDialog(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
