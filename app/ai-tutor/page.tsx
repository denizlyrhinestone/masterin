"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Brain, Send, Sparkles, ThumbsDown, ThumbsUp, Lightbulb, Zap, RotateCcw } from "lucide-react"
import { useAIConversation } from "@/hooks/use-ai-conversation"
import { ConversationHistory } from "@/components/conversation-history"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample suggested questions
const suggestedQuestions = [
  "Explain the process of photosynthesis",
  "How do I solve quadratic equations?",
  "What are the key events of World War II?",
  "Help me understand Newton's laws of motion",
  "What is the difference between mitosis and meiosis?",
]

// Subject options
const subjectOptions = [
  { value: "biology", label: "Biology" },
  { value: "chemistry", label: "Chemistry" },
  { value: "physics", label: "Physics" },
  { value: "mathematics", label: "Mathematics" },
  { value: "history", label: "History" },
  { value: "literature", label: "Literature" },
  { value: "general", label: "General" },
]

export default function AITutorPage() {
  // For demo purposes, we'll use a fixed user ID
  const userId = "user-123"

  const [subject, setSubject] = useState<string | undefined>(undefined)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, setInput, handleSubmit, isLoading, error, modelInfo, sessionId, resetConversation } =
    useAIConversation({
      userId,
      subject,
      initialMessages: [
        {
          id: "welcome",
          role: "assistant",
          content: "Hi there! I'm your AI tutor. How can I help with your studies today?",
        },
      ],
    })

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Handle subject change
  const handleSubjectChange = (value: string) => {
    setSubject(value === "general" ? undefined : value)
    resetConversation()
  }

  // Handle suggested question
  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="h-[calc(100vh-12rem)] overflow-hidden">
            <CardHeader className="border-b bg-muted/30 px-6">
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10 border-2 border-primary">
                  <AvatarImage src="/abstract-ai-network.png" alt="AI" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>AI Tutor</CardTitle>
                  <CardDescription>
                    {modelInfo.provider && modelInfo.model
                      ? `Using ${modelInfo.provider} (${modelInfo.model})`
                      : "Powered by advanced AI"}
                  </CardDescription>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Select value={subject || "general"} onValueChange={handleSubjectChange}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={resetConversation} title="New conversation">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-6">
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    {message.role === "assistant" && (
                      <Avatar className="mr-2 mt-0.5 h-8 w-8">
                        <AvatarImage src="/abstract-ai-network.png" alt="AI" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2 max-w-[80%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : message.id === "error"
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
                      {message.role === "assistant" && message.id !== "error" && (
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
                    {message.role === "user" && (
                      <Avatar className="ml-2 mt-0.5 h-8 w-8">
                        <AvatarImage src="/diverse-students-studying.png" alt="User" />
                        <AvatarFallback>ME</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <Avatar className="mr-2 mt-0.5 h-8 w-8">
                      <AvatarImage src="/abstract-ai-network.png" alt="AI" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="rounded-2xl px-4 py-2 bg-muted">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-current"></div>
                        <div className="h-2 w-2 animate-pulse rounded-full bg-current"></div>
                        <div className="h-2 w-2 animate-pulse rounded-full bg-current"></div>
                      </div>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="flex justify-start">
                    <Avatar className="mr-2 mt-0.5 h-8 w-8">
                      <AvatarImage src="/abstract-ai-network.png" alt="AI" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="rounded-2xl px-4 py-2 bg-destructive/10 text-destructive">
                      <p>{error}</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/30 p-4">
              <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
                <Textarea
                  placeholder="Ask me anything about your studies..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      if (input.trim()) {
                        handleSubmit(e as any)
                      }
                    }
                  }}
                  className="min-h-12 flex-1 rounded-xl border-muted bg-background"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="h-12 w-12 rounded-xl"
                >
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Tabs defaultValue="history">
            <TabsList className="grid w-full grid-cols-3 rounded-lg bg-muted p-1">
              <TabsTrigger value="history" className="rounded-md">
                History
              </TabsTrigger>
              <TabsTrigger value="suggested" className="rounded-md">
                Suggested
              </TabsTrigger>
              <TabsTrigger value="features" className="rounded-md">
                Features
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="mt-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Conversation History</CardTitle>
                  <CardDescription>Your previous AI tutor sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ConversationHistory
                    userId={userId}
                    onSelectSession={(id) => console.log("Selected session:", id)}
                    onNewSession={resetConversation}
                    currentSessionId={sessionId}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suggested" className="mt-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Try asking</CardTitle>
                  <CardDescription>Select a question to get started</CardDescription>
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
                        <Lightbulb className="mr-2 h-4 w-4 text-primary" />
                        {question}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">AI Tutor Features</CardTitle>
                  <CardDescription>How our AI tutor helps you learn</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg bg-primary/5 p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Continuous Conversations</h3>
                          <p className="text-sm text-muted-foreground">
                            Have extended dialogues with context awareness
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-secondary/5 p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-secondary/10 p-2">
                          <Brain className="h-4 w-4 text-secondary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Subject Specialization</h3>
                          <p className="text-sm text-muted-foreground">Get expert help in specific academic subjects</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-accent/5 p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-accent/10 p-2">
                          <Zap className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-medium">Conversation History</h3>
                          <p className="text-sm text-muted-foreground">Save and revisit your learning conversations</p>
                        </div>
                      </div>
                    </div>
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
