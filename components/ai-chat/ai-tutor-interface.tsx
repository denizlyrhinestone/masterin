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
  const [serviceStatus, setServiceStatus] = useState<{
    status: "operational" | "degraded" | "offline" | "unknown"
    provider?: string
    lastChecked: Date | null
  }>({
    status: "unknown",
    lastChecked: null,
  })
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

  // Check AI service health on component mount
  useEffect(() => {
    checkServiceHealth()
  }, [])

  // Check AI service health
  const checkServiceHealth = async () => {
    try {
      const response = await fetch("/api/ai-health")
      if (!response.ok) throw new Error("Health check failed")

      const data = await response.json()

      setServiceStatus({
        status: data.status,
        provider: data.activeProvider,
        lastChecked: new Date(),
      })

      // If service is operational but we're in offline mode, switch back
      if (data.status === "operational" && isOfflineMode) {
        setIsOfflineMode(false)
        setConsecutiveErrors(0)

        // Add system message about reconnection
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + "-system",
            role: "system",
            content: "AI service is now available. Full capabilities restored.",
            timestamp: new Date(),
            status: "success",
          },
        ])
      }
    } catch (error) {
      console.error("Error checking AI service health:", error)
      setServiceStatus({
        status: "unknown",
        lastChecked: new Date(),
      })
    }
  }

  // Force a health check on all providers
  const forceHealthCheck = async () => {
    try {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-system",
          role: "system",
          content: "Running AI service diagnostics...",
          timestamp: new Date(),
          status: "success",
        },
      ])

      const response = await fetch("/api/ai-health", {
        method: "POST",
      })

      if (!response.ok) throw new Error("Health check failed")

      const data = await response.json()

      // Update service status based on results
      const anyAvailable = Object.values(data.results).some(Boolean)

      setServiceStatus({
        status: anyAvailable ? "operational" : "offline",
        lastChecked: new Date(),
      })

      // Add system message with results
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-system",
          role: "system",
          content: `Diagnostics complete. AI service status: ${anyAvailable ? "Available" : "Unavailable"}`,
          timestamp: new Date(),
          status: "success",
        },
      ])

      // If any service is available but we're in offline mode, switch back
      if (anyAvailable && isOfflineMode) {
        setIsOfflineMode(false)
        setConsecutiveErrors(0)
      }
    } catch (error) {
      console.error("Error running health checks:", error)

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-system",
          role: "system",
          content: "Diagnostics failed. Unable to determine AI service status.",
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
                  content:
                    "I'm currently in offline mode with limited capabilities. To provide better assistance, please try reconnecting when the AI service is available again. In the meantime, could you specify what you'd like to learn about?",
                  status: "success",
                  isFallback: true,
                  errorCode: "OFFLINE_MODE",
                }
              : msg,
          ),
        )
        setIsLoading(false)
        return
      }

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

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response from AI tutor")
      }

      // Update service status based on response
      setServiceStatus({
        status: data.fallback ? "degraded" : "operational",
        provider: data.provider,
        lastChecked: new Date(),
      })

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
              }
            : msg,
        ),
      )

      // If we got a fallback response from the server, increment error count
      if (data.fallback) {
        setConsecutiveErrors((prev) => prev + 1)

        // If we've had multiple fallback responses, switch to offline mode
        if (consecutiveErrors >= 2 || data.errorCode === "SERVICE_COOLDOWN") {
          setIsOfflineMode(true)

          // Add system message about offline mode
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString() + "-system",
              role: "system",
              content: "Switched to offline mode due to AI service issues. Some features may be limited.",
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

      // Update service status to reflect the error
      setServiceStatus({
        status: "offline",
        lastChecked: new Date(),
      })

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
                  content:
                    "I'm having trouble connecting to my knowledge base. Could you ask a more specific question that I might be able to answer with my basic capabilities?",
                  status: "success",
                  isFallback: true,
                  errorCode: "CONNECTIVITY_FAILURE",
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
      } else {
        // Update the placeholder message with error status
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantPlaceholder.id
              ? {
                  ...msg,
                  content:
                    "I encountered an error processing your request. Please try again or ask a different question.",
                  status: "error",
                  errorCode: "REQUEST_FAILED",
                }
              : msg,
          ),
        )
      }

      // Show error toast
      toast({
        title: "AI Tutor Error",
        description: error.message || "Failed to get a response. Please try again.",
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

    // Run health check
    forceHealthCheck()
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
                  {serviceStatus.status === "degraded" && !isOfflineMode && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      Limited Capabilities
                    </span>
                  )}
                  {serviceStatus.status === "operational" && serviceStatus.provider && (
                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      {serviceStatus.provider} Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {(isOfflineMode || serviceStatus.status !== "operational") && (
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
                {retryCount > 0 && !isLoading && (
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
                      onClick={forceHealthCheck}
                      className="flex items-center gap-1 text-xs"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      Run Diagnostics
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
