"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Send, BookOpen, Code, Calculator, Globe, AlertTriangle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Define message type
type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

export function AiTutor() {
  const [activeTab, setActiveTab] = useState("general")
  const messagesEndRef = useRef<HTMLDivElement>(null)
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
      const response = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
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
              <div className="flex gap-2">
                <Textarea
                  name="message"
                  placeholder="Ask a question or describe what you want to learn..."
                  value={input}
                  onChange={handleInputChange}
                  className="flex-1 min-h-[80px]"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !input.trim()} className="self-end">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
              {isLoading && (
                <div className="mt-2 text-xs text-gray-500 flex items-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Thinking... This may take a moment.
                </div>
              )}
            </form>
          </div>
        </CardContent>
      </Tabs>
    </Card>
  )
}
