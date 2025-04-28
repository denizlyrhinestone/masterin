"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Send, Bot, User, ArrowRight, Loader2, AlertTriangle, RefreshCw } from "lucide-react"
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

interface AIChatWidgetProps {
  compact?: boolean
  extraCompact?: boolean
  expanded?: boolean
}

export default function AIChatWidget({ compact = false, extraCompact = false, expanded = false }: AIChatWidgetProps) {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: expanded
        ? "Welcome to Masterin AI! I'm your personal AI tutor, ready to help you learn any subject. Ask me anything about math, science, programming, languages, or any other academic topic."
        : extraCompact
          ? "Hi! How can I help you today?"
          : "Hi there! I'm your AI assistant from Masterin. How can I help you learn about our platform today?",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(
    expanded
      ? [
          "Explain the quadratic formula",
          "How do I solve this calculus problem?",
          "Help me understand photosynthesis",
          "What's the difference between Python and JavaScript?",
        ]
      : [
          "What AI tools do you offer?",
          "How can Masterin help me learn?",
          "Tell me about your pricing",
          "What subjects do you cover?",
        ],
  )
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId] = useState(() => uuidv4())
  const [isError, setIsError] = useState(false)
  const [retryAttempt, setRetryAttempt] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContentRef = useRef<HTMLDivElement>(null)

  // Memoized scroll function to prevent unnecessary re-renders
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      // Use requestAnimationFrame to ensure DOM updates have completed
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      })
    }
  }, [])

  // Scroll to bottom when messages change, but debounce to prevent thrashing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [messages, scrollToBottom])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isTyping) return

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
    }

    // Add a loading message from the assistant
    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      role: "assistant",
      content: "",
      isLoading: true,
    }

    setMessages((prev) => [...prev, userMessage, loadingMessage])
    setInputValue("")
    setIsTyping(true)
    setIsError(false)

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

      // For extraCompact mode, truncate long responses
      let responseText = data.text || "I received your message but couldn't generate a proper response."
      if (extraCompact && responseText.length > 100) {
        responseText = responseText.substring(0, 100) + "... (click 'Open Full Chat' for complete answer)"
      }

      // Update messages in a single state update to prevent flickering
      setMessages((prev) => {
        // Remove the loading message
        const withoutLoading = prev.filter((msg) => !msg.isLoading)

        // Add the response as an assistant message
        return [
          ...withoutLoading,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: responseText,
          },
        ]
      })

      // Reset retry attempts on successful response
      setRetryAttempt(0)
    } catch (error) {
      console.error("Error fetching AI response:", error)

      // Update messages in a single state update to prevent flickering
      setMessages((prev) => {
        // Remove the loading message
        const filtered = prev.filter((msg) => !msg.isLoading)

        // If we've had multiple errors, show an error message
        if (retryAttempt > 0) {
          setIsError(true)
          return [
            ...filtered,
            {
              id: `error-${Date.now()}`,
              role: "error",
              content: extraCompact
                ? "Error. Try again later."
                : `I'm experiencing technical difficulties. ${error instanceof Error ? error.message : "Please try again in a moment or refresh the page."}`,
            },
          ]
        }

        // Otherwise, use a fallback response
        return [
          ...filtered,
          {
            id: `fallback-${Date.now()}`,
            role: "assistant",
            content: generateFallbackResponse(inputValue.trim(), extraCompact),
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
    }
  }

  // Generate a fallback response when API call fails
  const generateFallbackResponse = (input: string, isExtraCompact = false): string => {
    // Simple response based on input keywords
    const lowerInput = input.toLowerCase()

    if (isExtraCompact) {
      return "For a detailed answer, please click 'Open Full Chat' below."
    }

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

    if (expanded) {
      // For expanded mode, provide more academic-focused suggestions
      if (lowerInput.includes("math") || lowerInput.includes("calculus") || lowerInput.includes("algebra")) {
        setSuggestedQuestions([
          "Explain the chain rule in calculus",
          "How do I solve quadratic equations?",
          "What is the Pythagorean theorem?",
          "Help me understand logarithms",
        ])
        return
      }

      if (lowerInput.includes("physics") || lowerInput.includes("force") || lowerInput.includes("motion")) {
        setSuggestedQuestions([
          "Explain Newton's laws of motion",
          "How does gravity work?",
          "What is the theory of relativity?",
          "Explain potential vs kinetic energy",
        ])
        return
      }

      if (lowerInput.includes("code") || lowerInput.includes("programming") || lowerInput.includes("javascript")) {
        setSuggestedQuestions([
          "How do I create a function in JavaScript?",
          "Explain object-oriented programming",
          "What are arrays and how do I use them?",
          "Help me debug this code snippet",
        ])
        return
      }

      // Default academic questions
      setSuggestedQuestions([
        "How do I write a good essay?",
        "Explain photosynthesis",
        "What's the difference between DNA and RNA?",
        "Help me understand the periodic table",
      ])
    } else {
      // Original product-focused suggestions
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

  // Adjust height based on mode
  const chatHeight = extraCompact ? "h-[350px]" : expanded ? "h-[600px]" : compact ? "h-[450px]" : "h-[500px]"

  return (
    <Card
      className={`border-0 shadow-lg overflow-hidden ${chatHeight} flex flex-col will-change-transform ${
        extraCompact
          ? "transform-gpu w-full max-w-[250px] mx-auto lg:max-w-none"
          : compact
            ? "transform-gpu w-full max-w-[350px] mx-auto lg:max-w-none"
            : ""
      }`}
      style={{ contain: "content" }}
    >
      <CardHeader
        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-2"
        aria-controls="chat-content"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-2" aria-hidden="true">
              <Bot className="w-3 h-3 text-purple-600" />
            </div>
            <CardTitle className={`${extraCompact ? "text-sm" : compact ? "text-base" : "text-lg"}`}>
              Masterin Assistant
            </CardTitle>
          </div>
          {!extraCompact && (
            <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-xs">
              AI Powered
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent
        id="chat-content"
        ref={chatContentRef}
        className="p-3 flex-grow overflow-y-auto overscroll-contain"
        role="log"
        aria-live="polite"
        style={{ contain: "paint" }}
      >
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              style={{ contain: "content" }}
            >
              <div className={`flex max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
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
                          ? "bg-gray-100 dark:bg-gray-800"
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
      {expanded && (
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
      )}

      <CardFooter className="p-2 border-t">
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
          <Input
            id="chat-input"
            type="text"
            placeholder={
              expanded
                ? "Ask me anything about your studies..."
                : extraCompact
                  ? "Ask..."
                  : compact
                    ? "Ask a question..."
                    : "Ask about Masterin..."
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-grow text-sm"
            disabled={isTyping}
            aria-label="Type your message"
          />
          <Button type="submit" size="sm" disabled={!inputValue.trim() || isTyping} aria-label="Send message">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardFooter>

      <div className="p-1 bg-gray-50 dark:bg-gray-900 border-t text-center">
        <Link href="/ai/chat">
          <Button variant="outline" size="sm" className="w-full group text-xs h-7">
            Open Full Chat <ArrowRight className="ml-1 w-2 h-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </Card>
  )
}
