"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Brain, Send, Sparkles, ThumbsDown, ThumbsUp, BookOpen } from "lucide-react"

// Sample suggested questions
const suggestedQuestions = [
  "Explain the concept of photosynthesis",
  "How do I solve quadratic equations?",
  "What are the key events of World War II?",
  "Help me understand Newton's laws of motion",
  "What is the difference between metaphor and simile?",
]

// Sample chat history
const initialChatHistory = [
  {
    role: "assistant",
    content: "Hello! I'm your AI tutor. How can I help you with your studies today?",
    timestamp: new Date().toISOString(),
  },
]

export default function AITutorPage() {
  const [chatHistory, setChatHistory] = useState(initialChatHistory)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  // Add a new state for the AI model info
  const [modelInfo, setModelInfo] = useState({ provider: "", model: "" })

  const handleSendMessage = async () => {
    if (!message.trim()) return

    // Add user message to chat
    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    }

    setChatHistory((prev) => [...prev, userMessage])
    setMessage("")
    setIsLoading(true)

    try {
      // Call the AI tutor API
      const response = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...chatHistory, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from AI tutor")
      }

      const data = await response.json()

      // Update model info if available
      if (data.provider && data.model) {
        setModelInfo({
          provider: data.provider,
          model: data.model,
        })
      }

      // Add AI response to chat
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.content,
          timestamp: new Date().toISOString(),
        },
      ])
    } catch (error) {
      console.error("Error:", error)

      // Add error message to chat
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again later.",
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setMessage(question)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">AI Tutor</h1>
        <p className="text-muted-foreground">Get personalized help with your studies 24/7.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/abstract-ai-network.png" alt="AI" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">AI Tutor</CardTitle>
                  <CardDescription>
                    {modelInfo.provider && modelInfo.model
                      ? `Using ${modelInfo.provider} (${modelInfo.model})`
                      : "Powered by advanced AI"}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="ml-auto flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>Smart</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pb-0">
              <div className="space-y-4">
                {chatHistory.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : message.isError
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted"
                      }`}
                    >
                      <div className="prose prose-sm dark:prose-invert">
                        {message.content.split("\n").map((line, i) => (
                          <p key={i} className={i > 0 ? "mt-2" : ""}>
                            {line}
                          </p>
                        ))}
                      </div>
                      {message.role === "assistant" && !message.isError && (
                        <div className="mt-2 flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                            <ThumbsUp className="h-3 w-3" />
                            <span className="sr-only">Helpful</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                            <ThumbsDown className="h-3 w-3" />
                            <span className="sr-only">Not helpful</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-lg px-4 py-2 bg-muted">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-current"></div>
                        <div className="h-2 w-2 animate-pulse rounded-full bg-current"></div>
                        <div className="h-2 w-2 animate-pulse rounded-full bg-current"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              <div className="flex w-full items-center space-x-2">
                <Textarea
                  placeholder="Ask me anything about your studies..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  className="min-h-12 flex-1"
                />
                <Button onClick={handleSendMessage} disabled={isLoading || !message.trim()} size="icon">
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Tabs defaultValue="suggested">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="suggested">Suggested</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="suggested" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Suggested Questions</CardTitle>
                  <CardDescription>Try asking one of these questions to get started</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {suggestedQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start text-left"
                        onClick={() => handleSuggestedQuestion(question)}
                      >
                        <Brain className="mr-2 h-4 w-4 text-primary" />
                        {question}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">AI Tutor Features</CardTitle>
                  <CardDescription>How our AI tutor can help you learn</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Personalized Learning</h3>
                        <p className="text-xs text-muted-foreground">
                          Get tailored explanations based on your learning style
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Brain className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Concept Mastery</h3>
                        <p className="text-xs text-muted-foreground">
                          Break down complex topics into easy-to-understand explanations
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Practice Problems</h3>
                        <p className="text-xs text-muted-foreground">
                          Get practice problems with step-by-step solutions
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chat History</CardTitle>
                  <CardDescription>Your recent conversations with AI Tutor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Brain className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No previous chats</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Your chat history will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
