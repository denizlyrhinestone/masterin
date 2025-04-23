"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Paperclip, Bot, User, Loader2, ArrowLeft, Sparkles, BookOpen, Lightbulb } from "lucide-react"
import Link from "next/link"

// Message type definition
type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  status: "sending" | "sent" | "error"
}

// Sample subjects for quick prompts
const sampleSubjects = [
  { name: "Mathematics", icon: <BookOpen className="w-4 h-4" /> },
  { name: "Physics", icon: <Sparkles className="w-4 h-4" /> },
  { name: "Computer Science", icon: <Lightbulb className="w-4 h-4" /> },
  { name: "Chemistry", icon: <Sparkles className="w-4 h-4" /> },
]

// Sample quick prompts
const quickPrompts = [
  "Explain the concept of derivatives in calculus",
  "Help me understand quantum mechanics",
  "What is object-oriented programming?",
  "How do I solve quadratic equations?",
]

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi there! I'm your AI tutor. How can I help you with your learning today?",
      timestamp: new Date(),
      status: "sent",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
      status: "sending",
    }

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate AI response delay
    setTimeout(() => {
      // Generate AI response based on user input
      const aiResponse = generateAIResponse(inputValue)

      // Create assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
        status: "sent",
      }

      // Add assistant message to chat
      setMessages((prev) => [
        ...prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "sent" } : msg)),
        assistantMessage,
      ])
      setIsLoading(false)
    }, 1500)
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real implementation, you would upload the file to a server
      // For now, we'll just add a message about the file
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: `I've uploaded a file: ${file.name}`,
        timestamp: new Date(),
        status: "sent",
      }
      setMessages((prev) => [...prev, userMessage])

      // Simulate AI response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I've received your file "${file.name}". What would you like to know about it?`,
          timestamp: new Date(),
          status: "sent",
        }
        setMessages((prev) => [...prev, assistantMessage])
      }, 1000)
    }
  }

  // Simple function to generate responses based on input
  // In a real implementation, this would call an AI API
  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("derivative") || lowerInput.includes("calculus")) {
      return "In calculus, a derivative measures the sensitivity to change of a function's output with respect to its input. It's written as f'(x) or df/dx. The derivative of a function at a chosen input value describes the rate of change of the function at that point. For example, the derivative of f(x) = x² is f'(x) = 2x. Would you like me to explain this further or provide some examples?"
    }

    if (lowerInput.includes("quantum") || lowerInput.includes("mechanics")) {
      return "Quantum mechanics is a fundamental theory in physics that describes nature at the smallest scales of energy levels of atoms and subatomic particles. Unlike classical physics, quantum mechanics allows particles to exist in multiple states simultaneously (superposition) until measured. This leads to fascinating phenomena like quantum entanglement and the uncertainty principle. Would you like me to explain a specific concept in quantum mechanics?"
    }

    if (lowerInput.includes("object") && lowerInput.includes("programming")) {
      return "Object-oriented programming (OOP) is a programming paradigm based on the concept of 'objects', which can contain data and code. The data is in the form of fields (attributes or properties), and the code is in the form of procedures (methods). Key concepts in OOP include:\n\n1. Classes and Objects\n2. Encapsulation\n3. Inheritance\n4. Polymorphism\n\nWould you like me to explain any of these concepts in more detail?"
    }

    if (lowerInput.includes("quadratic") || lowerInput.includes("equation")) {
      return "To solve a quadratic equation in the form ax² + bx + c = 0:\n\n1. Use the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a\n2. Calculate the discriminant (b² - 4ac)\n3. If the discriminant is positive, there are two real solutions\n4. If it's zero, there's one real solution\n5. If it's negative, there are two complex solutions\n\nWould you like to try solving an example together?"
    }

    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return "Hello! I'm your AI tutor. What subject would you like to learn about today?"
    }

    if (lowerInput.includes("thank")) {
      return "You're welcome! Is there anything else you'd like to learn about?"
    }

    return "That's an interesting question! I'd be happy to help you learn about this topic. Could you provide a bit more detail about what specific aspects you'd like to understand better?"
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/ai" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">AI Tutor Chat</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Online</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto p-4 sm:p-6">
        <div className="container mx-auto max-w-4xl">
          {/* Welcome Card */}
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-4">
                  <Bot className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Welcome to your AI Tutor</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    I'm here to help you learn and understand any subject
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Ask me any question about your studies, and I'll provide personalized explanations, examples, and
                practice problems to help you master the concepts.
              </p>
              <div className="flex flex-wrap gap-2">
                {sampleSubjects.map((subject, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="bg-white dark:bg-gray-800"
                    onClick={() => setInputValue(`Help me learn about ${subject.name}`)}
                  >
                    {subject.icon}
                    <span className="ml-1">{subject.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "user"
                        ? "bg-purple-100 dark:bg-purple-900/30 ml-2"
                        : "bg-blue-100 dark:bg-blue-900/30 mr-2"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4 text-purple-600" />
                    ) : (
                      <Bot className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        message.role === "user" ? "text-purple-200" : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {message.status === "sending" && (
                        <span className="ml-2">
                          <Loader2 className="w-3 h-3 inline animate-spin" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex flex-row">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 mr-2">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="rounded-lg p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-2 px-4">
        <div className="container mx-auto max-w-4xl overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {quickPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
                onClick={() => setInputValue(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <Button type="button" size="icon" variant="ghost" onClick={handleFileUpload} className="flex-shrink-0">
              <Paperclip className="w-5 h-5 text-gray-500" />
            </Button>
            <Input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <Input
              type="text"
              placeholder="Ask your question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" disabled={!inputValue.trim() || isLoading} className="flex-shrink-0">
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Your AI tutor is here to help you learn, not to do your homework for you.
          </p>
        </div>
      </div>
    </div>
  )
}
