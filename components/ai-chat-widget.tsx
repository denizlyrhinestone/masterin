"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Send, Bot, User, ArrowRight, Loader2, ThumbsUp, ThumbsDown, AlertTriangle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { v4 as uuidv4 } from "uuid"
import { useToast } from "@/hooks/use-toast"

type Message = {
  id: string
  role: "user" | "assistant" | "system" | "error"
  content: string
  isLoading?: boolean
  feedback?: "positive" | "negative"
}

export default function AIChatWidget() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi there! I'm your AI assistant from Masterin. How can I help you learn about our platform today?",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isExpanded, setIsExpanded] = useState(true) // Start expanded on the homepage
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "What AI tools do you offer?",
    "How can Masterin help me learn?",
    "Tell me about your pricing",
    "What subjects do you cover?",
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId] = useState(() => uuidv4())
  const [isError, setIsError] = useState(false)
  const [retryAttempt, setRetryAttempt] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
    }

    // Add a loading message from the assistant
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      isLoading: true,
    }

    setMessages((prev) => [...prev, userMessage, loadingMessage])
    setInputValue("")
    setIsTyping(true)
    setIsError(false)

    // Scroll to bottom
    setTimeout(() => {
      scrollToBottom()
    }, 100)

    try {
      // Prepare messages for API - only include content and role
      const apiMessages = messages
        .filter((msg) => !msg.isLoading && msg.role !== "error")
        .map(({ role, content }) => ({ role, content }))

      // Add the new user message
      apiMessages.push({ role: userMessage.role, content: userMessage.content })

      // Make API call with error handling
      let response
      try {
        response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, sessionId }),
        })
      } catch (fetchError) {
        console.error("Network error:", fetchError)
        throw new Error("Network error. Please check your connection.")
      }

      // Handle non-OK responses
      if (!response.ok) {
        let errorMessage = `Error: ${response.status} ${response.statusText}`

        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch (e) {
          // If we can't parse JSON, try to get text
          try {
            const text = await response.text()
            if (text) errorMessage = text
          } catch (textError) {
            // If we can't get text either, use the default error message
          }
        }

        throw new Error(errorMessage)
      }

      // Parse the JSON response
      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error("Error parsing response:", jsonError)
        throw new Error("Received invalid response from server")
      }

      // Remove the loading message
      setMessages((prev) => prev.filter((msg) => !msg.isLoading))

      // Add the response as an assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: data.text || "I received your message but couldn't generate a proper response.",
        },
      ])

      // Reset retry attempts on successful response
      setRetryAttempt(0)
    } catch (error) {
      console.error("Error fetching AI response:", error)

      // Remove the loading message and add a fallback response
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.isLoading)

        // If we've had multiple errors, show an error message
        if (retryAttempt > 0) {
          setIsError(true)
          return [
            ...filtered,
            {
              id: (Date.now() + 2).toString(),
              role: "error",
              content: `I'm experiencing technical difficulties. ${error instanceof Error ? error.message : "Please try again in a moment or refresh the page."}`,
            },
          ]
        }

        // Otherwise, use a fallback response
        return [
          ...filtered,
          {
            id: (Date.now() + 2).toString(),
            role: "assistant",
            content: generateFallbackResponse(inputValue.trim()),
          },
        ]
      })

      // Increment retry attempt counter
      setRetryAttempt((prev) => prev + 1)

      // Show a toast notification on error
      if (retryAttempt > 0) {
        toast({
          title: "Connection Error",
          description:
            error instanceof Error
              ? error.message
              : "Having trouble connecting to the AI service. Please try again later.",
          variant: "destructive",
        })
      }
    } finally {
      setIsTyping(false)

      // Update suggested questions based on the conversation
      updateSuggestedQuestions(inputValue.trim())

      // Scroll to bottom again
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
  }

  // Generate a fallback response when API call fails
  const generateFallbackResponse = (input: string): string => {
    // Simple response based on input keywords
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("hello") || lowerInput.includes("hi") || lowerInput.includes("hey")) {
      return "Hello! I'm here to help with your questions about Masterin and assist with your learning needs. What would you like to know?"
    }

    if (lowerInput.includes("thank")) {
      return "You're welcome! I'm glad I could help. Is there anything else you'd like to know?"
    }

    if (lowerInput.includes("price") || lowerInput.includes("cost") || lowerInput.includes("subscription")) {
      return 'Masterin offers several pricing plans, including a free tier with basic features. For complete details on our Premium and Team plans, please click "Open Full Chat" below.'
    }

    if (lowerInput.includes("subject") || lowerInput.includes("topic") || lowerInput.includes("learn")) {
      return 'We cover a wide range of subjects including Mathematics, Science, Computer Science, and Humanities. For more details, please click "Open Full Chat" below.'
    }

    if (lowerInput.includes("feature") || lowerInput.includes("tool") || lowerInput.includes("offer")) {
      return 'Masterin offers several AI-powered learning tools including an AI Tutor for personalized explanations, Essay Assistant for writing help, Math Problem Solver, and more. For details, please click "Open Full Chat" below.'
    }

    // Generic fallback when all else fails
    return 'Thank you for your question. For the best experience and most detailed answers, please click the "Open Full Chat" button below where I can better assist you.'
  }

  // Update suggested questions based on the conversation context
  const updateSuggestedQuestions = (lastInput: string) => {
    // Simple pattern matching for common topics
    const lowerInput = lastInput.toLowerCase()

    if (lowerInput.includes("price") || lowerInput.includes("cost") || lowerInput.includes("subscription")) {
      setSuggestedQuestions([
        "What's included in the free trial?",
        "What features come with Premium?",
        "How does the Team plan work?",
        "Can I upgrade or downgrade anytime?",
      ])
      return
    }

    if (lowerInput.includes("subject") || lowerInput.includes("topic") || lowerInput.includes("learn")) {
      setSuggestedQuestions([
        "What math topics do you cover?",
        "Can you help with science subjects?",
        "Do you cover programming languages?",
        "How do you teach humanities subjects?",
      ])
      return
    }

    if (lowerInput.includes("feature") || lowerInput.includes("tool") || lowerInput.includes("offer")) {
      setSuggestedQuestions([
        "How does the AI Tutor work?",
        "Tell me about the Essay Assistant",
        "What can the Math Problem Solver do?",
        "How does the Code Mentor help?",
      ])
      return
    }

    // Default questions if we don't have specific context
    setSuggestedQuestions([
      "What makes Masterin different?",
      "How do I get started?",
      "Can I try before subscribing?",
      "Do you have mobile apps?",
    ])
  }

  const handleRetry = () => {
    // If we're in an error state, let's retry the last user message
    if (isError && messages.length >= 2) {
      const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")
      if (lastUserMessage) {
        setInputValue(lastUserMessage.content)

        // Remove the error message and the last user message to retry
        setMessages((prev) => prev.filter((m) => m.id !== lastUserMessage.id && m.role !== "error"))

        setIsError(false)
      }
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question)
    // Focus the input field
    const inputElement = document.getElementById("chat-input") as HTMLInputElement
    if (inputElement) {
      inputElement.focus()
    }
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  // Handle feedback on responses
  const handleFeedback = (messageId: string, feedbackType: "positive" | "negative") => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, feedback: feedbackType } : msg)))

    // In a real implementation, you would send this feedback to your backend
    console.log(`Feedback for message ${messageId}: ${feedbackType}`)
  }

  return (
    <Card className="border-0 shadow-lg overflow-hidden h-[500px] flex flex-col">
      <CardHeader
        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
              <Bot className="w-4 h-4 text-purple-600" />
            </div>
            <CardTitle className="text-lg">Masterin Assistant</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-white/20 hover:bg-white/30">
            AI Powered
          </Badge>
        </div>
      </CardHeader>

      {isExpanded && (
        <>
          <CardContent className="p-4 flex-grow overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === "user"
                          ? "bg-purple-100 dark:bg-purple-900/30 ml-2"
                          : message.role === "error"
                            ? "bg-red-100 dark:bg-red-900/30 mr-2"
                            : "bg-blue-100 dark:bg-blue-900/30 mr-2"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="w-3 h-3 text-purple-600" />
                      ) : message.role === "error" ? (
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                      ) : (
                        <Bot className="w-3 h-3 text-blue-600" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg p-3 text-sm ${
                        message.role === "user"
                          ? "bg-purple-600 text-white"
                          : message.role === "error"
                            ? "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                            : message.isLoading
                              ? "bg-gray-100 dark:bg-gray-800 animate-pulse"
                              : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      {message.isLoading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Thinking...</span>
                        </div>
                      ) : (
                        <div className="whitespace-pre-line">
                          {message.content}

                          {/* Retry button for error messages */}
                          {message.role === "error" && (
                            <div className="mt-2">
                              <Button variant="outline" size="sm" onClick={handleRetry} className="text-xs">
                                <RefreshCw className="h-3 w-3 mr-1" /> Try Again
                              </Button>
                            </div>
                          )}

                          {/* Feedback buttons for assistant messages */}
                          {message.role === "assistant" && !message.isLoading && message.id !== "welcome" && (
                            <div className="flex items-center justify-end mt-2 space-x-2 text-xs text-gray-500">
                              <span className="mr-1">Helpful?</span>
                              <button
                                onClick={() => handleFeedback(message.id, "positive")}
                                className={`p-1 rounded-full ${message.feedback === "positive" ? "bg-green-100 text-green-600" : "hover:bg-gray-200"}`}
                                aria-label="Thumbs up"
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleFeedback(message.id, "negative")}
                                className={`p-1 rounded-full ${message.feedback === "negative" ? "bg-red-100 text-red-600" : "hover:bg-gray-200"}`}
                                aria-label="Thumbs down"
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          {/* Suggested questions */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleSuggestedQuestion(question)}
                  disabled={isTyping}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>

          <CardFooter className="p-3 border-t">
            <form onSubmit={handleSubmit} className="flex w-full space-x-2">
              <Input
                id="chat-input"
                type="text"
                placeholder="Ask about Masterin..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-grow text-sm"
                disabled={isTyping}
              />
              <Button type="submit" size="sm" disabled={!inputValue.trim() || isTyping}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardFooter>
        </>
      )}

      <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t text-center">
        <div className="mb-1 text-xs text-green-600 dark:text-green-400 font-medium">
          Free unlimited access for everyone!
        </div>
        <Link href="/ai/chat">
          <Button variant="outline" size="sm" className="w-full group">
            Open Full Chat <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </Card>
  )
}
