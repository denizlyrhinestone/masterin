"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useChat } from "@ai-sdk/react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Send, BookOpen, Code, Calculator, Globe } from "lucide-react"

export function AiTutor() {
  const [activeTab, setActiveTab] = useState("general")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/ai-tutor",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello! I'm your AI learning assistant. I can help you understand concepts, solve problems, and provide learning resources. What would you like to learn today?",
      },
    ],
  })

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

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
      const form = new FormData()
      form.append("message", prompt)
      handleSubmit({ preventDefault: () => {}, currentTarget: { elements: { message: { value: prompt } } } } as any)
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
                />
                <Button type="submit" disabled={isLoading || !input.trim()} className="self-end">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Tabs>
    </Card>
  )
}
