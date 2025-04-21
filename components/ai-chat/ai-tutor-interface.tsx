"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChatMessage } from "./chat-message"
import { SubjectSelector } from "./subject-selector"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Sparkles, BookOpen, History, Info, Loader2 } from "lucide-react"

// Message type definition
type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

// Initial welcome message
const initialMessages: Message[] = [
  {
    id: "welcome-message",
    role: "assistant",
    content:
      "👋 Hi there! I'm your AI tutor. I can help you with a wide range of subjects including math, science, language arts, history, and more. What would you like to learn about today?",
    timestamp: new Date(),
  },
]

export function AITutorInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState("general")
  const [activeTab, setActiveTab] = useState("chat")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

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
          history: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from AI tutor")
      }

      const data = await response.json()

      // Add AI response to chat
      const aiMessage: Message = {
        id: Date.now().toString() + "-ai",
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error getting AI response:", error)

      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString() + "-error",
        role: "assistant",
        content:
          "I'm sorry, I encountered an error processing your request. Please try again or ask a different question.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
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
          <Card className="border-gray-200">
            <CardHeader className="border-b bg-gray-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-semibold">AI Tutor Chat</h3>
                </div>
                <SubjectSelector selectedSubject={selectedSubject} onSelectSubject={setSelectedSubject} />
              </div>
            </CardHeader>
            <CardContent className="h-[500px] overflow-y-auto p-4">
              <div className="flex flex-col space-y-4">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex items-center self-start rounded-lg bg-gray-100 px-4 py-2 text-gray-700">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Thinking...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <CardFooter className="border-t bg-white p-4">
              <div className="flex w-full items-end gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask anything about your studies..."
                  className="min-h-[80px] flex-1 resize-none"
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
