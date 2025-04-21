"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChatMessage } from "./chat-message"
import { SubjectSelector } from "./subject-selector"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Sparkles, BookOpen, History, Info, Loader2, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Message type definition with extended properties
type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  status?: "sending" | "error" | "success"
  isFallback?: boolean
  errorCode?: string
  provider?: string
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
  const [serviceHealth, setServiceHealth] = useState<{
    status: "operational" | "degraded" | "offline"
    lastChecked: Date | null
    provider?: string
  }>({
    status: "operational",
    lastChecked: null,
  })
  const [isAutoRetryEnabled, setIsAutoRetryEnabled] = useState(true)
  const [retryDelay, setRetryDelay] = useState(30) // seconds
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  // Get a fallback response when API is having issues
  const getFallbackResponse = (subject: string): string => {
    const subjectResponses = fallbackResponses[subject as keyof typeof fallbackResponses] || fallbackResponses.general
    const randomIndex = Math.floor(Math.random() * subjectResponses.length)
    return subjectResponses[randomIndex]
  }

  // Update service health status
  const updateServiceHealth = (status: "operational" | "degraded" | "offline", provider?: string) => {
    setServiceHealth({
      status,
      lastChecked: new Date(),
      provider,
    })

    // If service is operational, we can switch out of offline mode
    if (status === "operational" && isOfflineMode) {
      // Add a small delay to avoid immediate switching
      setTimeout(() => {
        setIsOfflineMode(false)
        // Add system message about reconnecting
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "-system",
            role: "system",
            content: "Successfully reconnected to AI service. Full capabilities restored.",
            timestamp: new Date(),
            status: "success",
          },
        ])
      }, 1000)
    }
  }

  // Setup auto-retry based on service health
  useEffect(() => {
    if (!isAutoRetryEnabled || serviceHealth.status === "operational" || isLoading) {
      // Clear any existing timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
      return
    }

    // If service is degraded or offline, setup auto-retry
    if (serviceHealth.status !== "operational" && !retryTimeoutRef.current) {
      retryTimeoutRef.current = setTimeout(() => {
        // Clear timeout reference
        retryTimeoutRef.current = null

        // Add system message about retry attempt
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "-system",
            role: "system",
            content: "Automatically checking AI service availability...",
            timestamp: new Date(),
            status: "success",
          },
        ])

        // Perform health check by sending a simple request
        handleHealthCheck()
      }, retryDelay * 1000)
    }
  }, [serviceHealth.status, isAutoRetryEnabled, isLoading, retryDelay])

  // Perform a health check on the AI service
  const handleHealthCheck = async () => {
    try {
      const response = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Hello, this is a health check. Please respond with 'operational' if you can process requests.",
          subject: "general",
          healthCheck: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Health check failed")
      }

      // Update service health based on response
      if (data.fallback) {
        updateServiceHealth("degraded", data.provider)

        // Add system message about degraded service
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "-system",
            role: "system",
            content:
              "AI service is responding but with limited capabilities. Some advanced features may be unavailable.",
            timestamp: new Date(),
            status: "success",
          },
        ])
      } else {
        updateServiceHealth("operational", data.provider)
        setConsecutiveErrors(0)

        // Add system message about restored service
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "-system",
            role: "system",
            content: "AI service is fully operational. All capabilities have been restored.",
            timestamp: new Date(),
            status: "success",
          },
        ])
      }
    } catch (error) {
      console.error("Health check failed:", error)
      updateServiceHealth("offline")

      // Add system message about offline service
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-system",
          role: "system",
          content: "AI service appears to be offline. Continuing in offline mode with limited capabilities.",
          timestamp: new Date(),
          status: "success",
        },
      ])
    }
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
      // Send message to AI and get response
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
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Server responded with status: ${response.status}`)
      }

      const data = await response.json()

      // Add detailed diagnostics if available
      if (data.diagnostics) {
        console.log("AI Service Diagnostics:", data.diagnostics)
      }

      // Update the service health based on response
      if (data.fallback) {
        updateServiceHealth(
          data.errorCode === "CONNECTION_ERROR" || data.errorCode === "AUTHENTICATION_ERROR" ? "offline" : "degraded",
          data.provider,
        )

        // If we got an authentication error, show a more helpful message
        if (data.errorCode === "AUTHENTICATION_ERROR") {
          setErrorMessage("API key validation failed. Please check your AI service configuration.")

          // Add system message about API key issue
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString() + "-system",
              role: "system",
              content:
                "There appears to be an issue with the AI service authentication. Please contact the administrator to verify API keys.",
              timestamp: new Date(),
              status: "success",
            },
          ])
        }
      } else {
        updateServiceHealth("operational", data.provider)
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
                errorCode: data.errorCode,
                provider: data.provider,
                diagnosticInfo: data.diagnostics, // Store diagnostic info for debugging
              }
            : msg,
        ),
      )

      // If we got a fallback response or specific error code from the server, handle accordingly
      if (data.fallback) {
        setConsecutiveErrors((prev) => prev + 1)

        // If we've had multiple fallback responses, switch to offline mode
        if (consecutiveErrors >= 2 || data.errorCode === "SERVICE_COOLDOWN") {
          setIsOfflineMode(true)

          // Add system message about offline mode with more details
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString() + "-system",
              role: "system",
              content: `Switched to offline mode due to ${data.errorCode || "connectivity issues"}. Some features may be limited. ${data.errorDetails ? `Details: ${data.errorDetails}` : ""}`,
              timestamp: new Date(),
              status: "success",
            },
          ])
        }
      } else {
        // Reset consecutive errors on successful response
        setConsecutiveErrors(0)
      }
    } catch (error: any) {
      console.error("Error getting AI response:", error)

      // Log detailed error information
      console.error("Error details:", {
        message: error.message,
        stack: error.stack?.split("\n")[0],
        isOfflineMode,
        consecutiveErrors,
      })

      // Update service health to reflect the error
      updateServiceHealth("offline")

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
                  errorCode: "CONNECTIVITY_FAILURE",
                  errorDetails: error.message,
                }
              : msg,
          ),
        )

        // Add system message about offline mode with error details
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "-system",
            role: "system",
            content: `Switched to offline mode due to connectivity issues. Error: ${error.message || "Unknown error"}`,
            timestamp: new Date(),
            status: "success",
          },
        ])
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
                  errorCode: "REQUEST_FAILED",
                  errorDetails: error.message,
                }
              : msg,
          ),
        )
      }

      // Show error toast with more specific information
      toast({
        title: "AI Tutor Error",
        description: `${error.message || "Failed to get a response"}. Try switching subjects or simplifying your question.`,
        variant: "destructive",
      })

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
      if (lastMessage.role === "assistant" && lastMessage.status === "error") {
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
  const handleReconnect = () => {
    setIsOfflineMode(false)
    setConsecutiveErrors(0)

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

    // Perform health check
    handleHealthCheck()
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

  // Toggle auto retry feature
  const toggleAutoRetry = () => {
    setIsAutoRetryEnabled(!isAutoRetryEnabled)

    // Add system message about auto retry status
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString() + "-system",
        role: "system",
        content: !isAutoRetryEnabled
          ? "Auto-retry enabled. System will periodically check for service availability."
          : "Auto-retry disabled. You'll need to manually reconnect when ready.",
        timestamp: new Date(),
        status: "success",
      },
    ])
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
                  {serviceHealth.status === "degraded" && !isOfflineMode && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      Limited Capabilities
                    </span>
                  )}
                  {serviceHealth.status === "operational" && serviceHealth.provider && (
                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      {serviceHealth.provider} Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {(isOfflineMode || serviceHealth.status !== "operational") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReconnect}
                      className="text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleAutoRetry}
                      className={`flex items-center gap-1 text-xs ${
                        isAutoRetryEnabled ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""
                      }`}
                    >
                      {isAutoRetryEnabled ? "Auto-Retry On" : "Auto-Retry Off"}
                    </Button>
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
                    <Send className="h-4 w-4" />
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
            <CardHeader>
              <h3 className="text-lg font-semibold">Session History</h3>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-amber-50 p-4 text-amber-800">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  <p className="font-medium">Coming Soon</p>
                </div>
                <p className="mt-2">
                  Soon you'll be able to view and continue your past learning sessions. This feature is currently under
                  development.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
