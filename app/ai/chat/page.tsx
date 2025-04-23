"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { Sparkles, BookOpen, Lightbulb, Info, Send, PaperclipIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { useChat } from "@ai-sdk/react"
import ReactMarkdown from "react-markdown"

// Message type from AI SDK
type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt?: Date
}

// Sample subjects for quick prompts
const sampleSubjects = [
  { name: "Mathematics", icon: <BookOpen className="w-4 h-4" /> },
  { name: "Physics", icon: <Sparkles className="w-4 h-4" /> },
  { name: "Computer Science", icon: <Lightbulb className="w-4 h-4" /> },
  { name: "Chemistry", icon: <Sparkles className="w-4 h-4" /> },
  { name: "Biology", icon: <Info className="w-4 h-4" /> },
]

// Sample quick prompts
const quickPrompts = [
  "Explain the concept of derivatives in calculus",
  "Help me understand quantum mechanics",
  "What is object-oriented programming?",
  "How do I solve quadratic equations?",
  "Explain DNA replication",
]

export default function AIChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, append } = useChat({
    api: "/api/chat",
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: "Hi there! I'm your AI tutor from Masterin. How can I help you with your learning today?",
      },
    ],
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleQuickPrompt = (prompt: string) => {
    append({
      role: "user",
      content: prompt,
    })
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      // Check file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf", "text/plain"]
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Unsupported file type",
          description: "Please upload an image, PDF, or text file",
          variant: "destructive",
        })
        return
      }

      // In a real implementation, you would upload the file to a server
      // For now, we'll just add a message about the file
      append({
        role: "user",
        content: `I've uploaded a file: ${file.name}`,
      })
    }
  }

  // Render the chat interface
  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <Card className="flex-1 flex flex-col overflow-hidden mb-4 shadow-lg">
        <div className="p-4 bg-purple-600 text-white">
          <h1 className="text-xl font-bold">Masterin AI Tutor</h1>
          <p className="text-sm opacity-90">Your personal AI learning assistant</p>
        </div>

        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user" ? "bg-purple-100 text-gray-800" : "bg-white border border-gray-200 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 bg-purple-600 text-white">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {message.createdAt?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) ||
                        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 bg-purple-600 text-white">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="flex space-x-2">
                    <div
                      className="h-2 w-2 bg-purple-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="h-2 w-2 bg-purple-600 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                    <div
                      className="h-2 w-2 bg-purple-600 rounded-full animate-bounce"
                      style={{ animationDelay: "600ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              An error occurred. Please try again.
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts */}
        <div className="px-4 py-2 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Suggested topics:</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.slice(0, 3).map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => handleQuickPrompt(prompt)}
                disabled={isLoading}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Ask anything about your studies..."
                className="min-h-[60px] resize-none pr-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleFileUpload}
                className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                <PaperclipIcon className="h-5 w-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/jpeg,image/png,image/gif,application/pdf,text/plain"
              />
            </div>
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
