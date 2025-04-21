"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChatMessage } from "./chat-message"
import { SubjectSelector } from "./subject-selector"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Sparkles, BookOpen, History, Info, Loader2, RefreshCw, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Message type definition
type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  status?: "sending" | "error" | "success"
  isFallback?: boolean
  diagnostics?: any
}

// Initial welcome message
const initialMessages: Message[] = [
  {
    id: "welcome-message",
    role: "assistant",
    content:
      "👋 Hi there! I'm your AI tutor. I can help you with a wide range of subjects including math, science, language arts, history, and more. What would you like to learn about today?",
    timestamp: new Date(),
    status: "success",
  },
]

// Sample responses for fallback mode (used when API is having issues)
const fallbackResponses = {
  math: [
    "In mathematics, it's important to understand the underlying concepts rather than just memorizing formulas. Could you tell me more specifically what math topic you're working on?",
    "Mathematics builds on foundational concepts. Let's break down your question step by step. Could you provide more details about what you're trying to solve?",
    "When approaching math problems, I recommend starting with the basics and working your way up. What specific concept are you struggling with?",
  ],
  science: [
    "Science is all about observation, hypothesis, and experimentation. Could you tell me more about the specific scientific concept you're interested in?",
    "In science, we often use models to understand complex phenomena. What particular aspect of science are you studying?",
    "Scientific understanding evolves over time as we gather more evidence. What specific science topic would you like to explore?",
  ],
  general: [
    "Learning is most effective when we connect new information to what we already know. Could you tell me more about what you're trying to learn?",
    "I'd be happy to help you understand this topic better. Could you provide more specific details about your question?",
    "Education is a journey of discovery. Let's explore this topic together. What specific aspects are you curious about?",
  ],
}

export function AITutorInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState("general")
  const [activeTab, setActiveTab] = useState("chat")
  const [retryCount, setRetryCount] = useState(0)
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [consecutiveErrors, setConsecutiveErrors] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  // Fetch diagnostic information on load
  useEffect(() => {
    async function fetchDiagnostics() {
      try {
        const response = await fetch("/api/ai-tutor")
        if (response.ok) {
          const data = await response.json()
          setDiagnosticInfo(data)

          // If OpenAI key is not validated, show a warning
          if (!data.openAIKeyValidated && data.openAIKeyError) {
            toast({
              title: "AI Service Warning",
              description: `There may be issues with the AI service: ${data.openAIKeyError}`,
              variant: "destructive",
            })
          }
        }
      } catch (error) {
        console.error("Error fetching diagnostics:", error)
      }
    }

    fetchDiagnostics()
  }, [])

  // Get a fallback response when API is having issues
  const getFallbackResponse = (subject: string): string => {
    const subjectResponses = fallbackResponses[subject as keyof typeof fallbackResponses] || fallbackResponses.general
    const randomIndex = Math.floor(Math.random() * subjectResponses.length)
    return subjectResponses[randomIndex]
  }

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      status: "success",
    }

    // Create placeholder for assistant message
    const assistantPlaceholder: Message = {
      id: Date.now().toString() + "-assistant",
      role: "assistant",
      content: "",
      timestamp: new Date(),
      status: "sending",
    }

    // Add user message to chat and clear input
    setMessages((prev) => [...prev, userMessage, assistantPlaceholder])
    setInput("")
    setIsLoading(true)
    setErrorMessage(null)

    try {
      // If in offline mode, use fallback responses
      if (isOfflineMode) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Update the placeholder message with a fallback response
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholder.id
              ? {
                  ...msg,
                  content: getFallbackResponse(selectedSubject),
                  status: "success",
                  isFallback: true,
                }
              : msg,
          ),
        )
        setIsLoading(false)
        return
      }

      // Send message to AI and get response with a timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          subject: selectedSubject,
          history: messages
            .filter((msg) => msg.role !== "system" && msg.status !== "sending")
            .map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
        }),
        signal: controller.signal,
      })

      // Clear the timeout
      clearTimeout(timeoutId)

      const data = await response.json()

      // Update diagnostic info if available
      if (data.diagnostics) {
        setDiagnosticInfo(data.diagnostics)
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response from AI tutor")
      }

      // Update the placeholder message with the actual response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantPlaceholder.id
            ? {
                ...msg,
                content: data.response,
                status: "success",
                isFallback: data.fallback || false,
                diagnostics: data.diagnostics,
              }
            : msg,
        ),
      )

      // Reset consecutive errors on successful response
      if (!data.fallback) {
        setConsecutiveErrors(0)
      } else {
        // If we got a fallback response from the server, increment error count
        setConsecutiveErrors((prev) => prev + 1)

        // If we've had multiple fallback responses, switch to offline mode
        if (consecutiveErrors >= 2) {
          setIsOfflineMode(true)

          // Add system message about offline mode
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString() + "-system",
              role: "system",
              content: "Switched to offline mode due to connectivity issues. Some features may be limited.",
              timestamp: new Date(),
              status: "success",
            },
          ])

          // Show toast notification
          toast({
            title: "Offline Mode Activated",
            description: "AI service is currently unavailable. Using simplified responses.",
            variant: "destructive",
          })
        }
      }
    } catch (error: any) {
      console.error("Error getting AI response:", error)

      // Increment consecutive errors
      setConsecutiveErrors((prev) => prev + 1)

      // If we've had multiple errors, switch to offline mode
      if (consecutiveErrors >= 2) {
        setIsOfflineMode(true)

        // Update the placeholder message with a fallback response
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholder.id
              ? {
                  ...msg,
                  content: getFallbackResponse(selectedSubject),
                  status: "success",
                  isFallback: true,
                }
              : msg,
          ),
        )

        // Add system message about offline mode
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "-system",
            role: "system",
            content: "Switched to offline mode due to connectivity issues. Some features may be limited.",
            timestamp: new Date(),
            status: "success",
          },
        ])

        // Show toast notification
        toast({
          title: "Offline Mode Activated",
          description: "AI service is currently unavailable. Using simplified responses.",
          variant: "destructive",
        })
      } else {
        // Update the placeholder message with error status
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholder.id
              ? {
                  ...msg,
                  content:
                    "I'm sorry, I encountered an error processing your request. You can try again or ask a different question.",
                  status: "error",
                }
              : msg,
          ),
        )

        // Show error toast with more specific information
        let errorMessage = "Failed to get a response. Please try again."

        if (error.name === "AbortError") {
          errorMessage = "Request timed out. Please try with a simpler question."
        } else if (error.message.includes("fetch")) {
          errorMessage = "Network error. Please check your connection."
        }

        toast({
          title: "AI Tutor Error",
          description: errorMessage,
          variant: "destructive",
        })
      }

      // Track error message for retry button
      setErrorMessage(error.message || "Unknown error")

      // Increment retry count
      setRetryCount((prev) => prev + 1)
    } finally {
      setIsLoading(false)
    }
  }

  // Retry the last message
  const handleRetry = async () => {
    if (isLoading) return

    // Find the last user message
    const lastUserMessage = [...messages].reverse().find((msg) => msg.role === "user")
    if (!lastUserMessage) return

    // Remove the last assistant message if it was an error
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1]
      if (lastMessage.role === "assistant" && (lastMessage.status === "error" || lastMessage.isFallback)) {
        return prev.slice(0, -1)
      }
      return prev
    })

    // Set the input to the last user message and send it
    setInput(lastUserMessage.content)
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  // Try to reconnect to the AI service
  const handleReconnect = async () => {
    setIsLoading(true)

    try {
      // Add system message about reconnecting
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-system",
          role: "system",
          content: "Attempting to reconnect to AI service...",
          timestamp: new Date(),
          status: "success",
        },
      ])

      // Fetch diagnostic information to check service status
      const response = await fetch("/api/ai-tutor")

      if (response.ok) {
        const data = await response.json()
        setDiagnosticInfo(data)

        if (data.status === "operational" && data.successRate > 50) {
          setIsOfflineMode(false)
          setConsecutiveErrors(0)

          // Add system message about successful reconnection
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString() + "-system-reconnected",
              role: "system",
              content: "Successfully reconnected to AI service. Full functionality restored.",
              timestamp: new Date(),
              status: "success",
            },
          ])

          toast({
            title: "Reconnected",
            description: "Successfully reconnected to AI service.",
            variant: "default",
          })
        } else {
          throw new Error("AI service still experiencing issues")
        }
      } else {
        throw new Error("Failed to check AI service status")
      }
    } catch (error) {
      console.error("Error reconnecting:", error)

      // Add system message about failed reconnection
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-system-reconnect-failed",
          role: "system",
          content: "Failed to reconnect to AI service. Remaining in offline mode.",
          timestamp: new Date(),
          status: "success",
        },
      ])

      toast({
        title: "Reconnection Failed",
        description: "Could not reconnect to AI service. Remaining in offline mode.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Clear chat history
  const handleClearChat = () => {
    setMessages(initialMessages)
    setRetryCount(0)
    setErrorMessage(null)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  // Handle subject change
  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject)

    // Add a system message about the subject change
    const subjectNames: Record<string, string> = {
      general: "General",
      math: "Mathematics",
      science: "Science",
      language: "Language Arts",
      history: "History",
      "computer-science": "Computer Science",
    }

    const systemMessage: Message = {
      id: Date.now().toString(),
      role: "system",
      content: `Subject changed to ${subjectNames[subject] || subject}`,
      timestamp: new Date(),
      status: "success",
    }

    setMessages((prev) => [...prev, systemMessage])
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="chat"
            className="flex items-center gap-2 transition-all duration-200 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Tutor</span>
          </TabsTrigger>
          <TabsTrigger
            value="resources"
            className="flex items-center gap-2 transition-all duration-200 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
          >
            <BookOpen className="h-4 w-4" />
            <span>Resources</span>
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="flex items-center gap-2 transition-all duration-200 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
          >
            <History className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-4">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b bg-gray-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-semibold">AI Tutor Chat</h3>
                  {isOfflineMode && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      Offline Mode
                    </span>
                  )}
                  {diagnosticInfo && !diagnosticInfo.openAIKeyValidated && (
                    <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                      API Key Issue
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isOfflineMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReconnect}
                      disabled={isLoading}
                      className="text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      {isLoading ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-1 h-3 w-3" />
                      )}
                      Reconnect
                    </Button>
                  )}
                  <SubjectSelector selectedSubject={selectedSubject} onSelectSubject={handleSubjectChange} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[500px] overflow-y-auto p-4 bg-gray-50/30">
              <div className="flex flex-col space-y-4">
                {messages.map((message) =>
                  message.role === "system" ? (
                    <div key={message.id} className="flex justify-center my-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {message.content}
                      </span>
                    </div>
                  ) : (
                    <ChatMessage key={message.id} message={message} />
                  ),
                )}
                {isLoading && messages[messages.length - 1]?.status !== "sending" && (
                  <div className="flex items-center self-start rounded-lg bg-gray-100 px-4 py-2 text-gray-700">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                )}
                {retryCount > 0 && !isLoading && !isOfflineMode && (
                  <div className="flex items-center justify-center gap-2 my-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                      className="flex items-center gap-1 text-xs"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Retry Last Question
                    </Button>
                  </div>
                )}
                {diagnosticInfo && !diagnosticInfo.openAIKeyValidated && !isOfflineMode && (
                  <div className="flex items-center justify-center my-2">
                    <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                      <AlertTriangle className="h-3 w-3" />
                      <span>
                        AI service configuration issue detected. Responses may be limited.
                        {diagnosticInfo.openAIKeyError && (
                          <span className="block mt-1 text-red-600">Error: {diagnosticInfo.openAIKeyError}</span>
                        )}
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <CardFooter className="border-t bg-white p-4">
              <div className="flex w-full items-end gap-2">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask anything about your studies..."
                  className="min-h-[80px] flex-1 resize-none focus:border-emerald-500 focus:ring-emerald-500"
                  disabled={isLoading}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 hover:shadow-md"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="sr-only">Send message</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearChat}
                    className="border-gray-300 transition-all duration-200 hover:bg-gray-100"
                    title="Clear chat"
                  >
                    <History className="h-4 w-4" />
                    <span className="sr-only">Clear chat</span>
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="mt-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Learning Resources</h3>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-amber-50 p-4 text-amber-800">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  <p className="font-medium">Coming Soon</p>
                </div>
                <p className="mt-2">
                  We're working on curating subject-specific resources to enhance your learning experience. Check back
                  soon!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="text-lg font-semibold">System Status</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const response = await fetch("/api/ai-tutor")
                    if (response.ok) {
                      const data = await response.json()
                      setDiagnosticInfo(data)
                      toast({
                        title: "Status Updated",
                        description: "System status information has been refreshed.",
                      })
                    }
                  } catch (error) {
                    console.error("Error fetching diagnostics:", error)
                  }
                }}
                className="text-xs"
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {diagnosticInfo ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-4">
                      <div className="text-sm font-medium text-gray-500">AI Service Status</div>
                      <div className="mt-1 flex items-center">
                        <span
                          className={`mr-2 h-3 w-3 rounded-full ${diagnosticInfo.openAIKeyValidated ? "bg-green-500" : "bg-red-500"}`}
                        ></span>
                        <span className="text-lg font-semibold">
                          {diagnosticInfo.openAIKeyValidated ? "Operational" : "Configuration Issue"}
                        </span>
                      </div>
                      {diagnosticInfo.openAIKeyError && (
                        <div className="mt-2 text-sm text-red-600">Error: {diagnosticInfo.openAIKeyError}</div>
                      )}
                    </div>

                    <div className="rounded-lg border p-4">
                      <div className="text-sm font-medium text-gray-500">Success Rate</div>
                      <div className="mt-1 text-lg font-semibold">{diagnosticInfo.successRate || 0}%</div>
                      <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-emerald-500"
                          style={{ width: `${diagnosticInfo.successRate || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {diagnosticInfo.recentRequests && (
                    <div className="rounded-lg border p-4">
                      <div className="mb-2 text-sm font-medium text-gray-500">Recent Requests</div>
                      <div className="max-h-[200px] overflow-y-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="pb-2 text-left font-medium text-gray-500">Time</th>
                              <th className="pb-2 text-left font-medium text-gray-500">Subject</th>
                              <th className="pb-2 text-left font-medium text-gray-500">Status</th>
                              <th className="pb-2 text-left font-medium text-gray-500">Response Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {diagnosticInfo.recentRequests.map((req: any, i: number) => (
                              <tr key={i} className="border-b last:border-0">
                                <td className="py-2">{new Date(req.timestamp).toLocaleTimeString()}</td>
                                <td className="py-2">{req.subject}</td>
                                <td className="py-2">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                      req.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {req.success ? "Success" : "Failed"}
                                  </span>
                                </td>
                                <td className="py-2">{req.responseTime ? `${req.responseTime}ms` : "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    Last updated: {new Date(diagnosticInfo.timestamp).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
