"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Send, PaperclipIcon, History, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useChat } from "@ai-sdk/react"
import ReactMarkdown from "react-markdown"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import ProtectedRoute from "@/components/protected-route"

// Types
type Conversation = {
  id: string
  title: string
  updated_at: string
}

type Message = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt?: Date
}

const quickPrompts = [
  "Explain the theory of relativity.",
  "Summarize the plot of Hamlet.",
  "What are the main causes of World War II?",
  "How does photosynthesis work?",
  "Explain the concept of blockchain technology.",
]

export default function AIChat() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get("id")
  const { isAuthenticated, user } = useAuth()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)
  const [initialMessages, setInitialMessages] = useState<Message[]>([])
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, append, reload, setMessages } = useChat({
    api: "/api/chat",
    body: { conversationId },
    initialMessages,
    onResponse: (response) => {
      // Extract conversation ID from the response
      if (response.ok) {
        const data = response.json()
        data.then((json) => {
          if (json.conversationId && !conversationId) {
            router.push(`/ai/chat?id=${json.conversationId}`)
          }
        })
      }
    },
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Add conversation history management
  // Add these functions to handle conversation history

  const fetchConversations = async () => {
    setIsLoadingConversations(true)
    try {
      const { data, error } = await supabase
        .from("chat_conversations")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(20)

      if (error) {
        throw error
      }

      setConversations(data || [])
    } catch (error) {
      console.error("Error fetching conversations:", error)
      toast({
        title: "Error",
        description: "Failed to load your conversation history",
        variant: "destructive",
      })
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const fetchMessages = async (id: string) => {
    setIsLoadingMessages(true)
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true })

      if (error) {
        throw error
      }

      // Format messages for the chat component
      const formattedMessages = data.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
        createdAt: new Date(msg.created_at),
      }))

      setInitialMessages(formattedMessages)
      setMessages(formattedMessages)
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load conversation messages",
        variant: "destructive",
      })
    } finally {
      setIsLoadingMessages(false)
    }
  }

  // Add these useEffect hooks to fetch conversations and messages

  // Fetch conversations on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations()
    }
  }, [isAuthenticated])

  // Fetch messages for selected conversation
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId)
    } else {
      setInitialMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Hi there! I'm your AI tutor from Masterin. How can I help you with your learning today?",
        },
      ])
    }
  }, [conversationId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleNewConversation = () => {
    router.push("/ai/chat")
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hi there! I'm your AI tutor from Masterin. How can I help you with your learning today?",
      },
    ])
  }

  const handleSelectConversation = (id: string) => {
    router.push(`/ai/chat?id=${id}`)
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

  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-full">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-semibold text-lg">Conversations</h2>
              <Button variant="ghost" size="sm" onClick={handleNewConversation}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {isLoadingConversations ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="mb-2">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))
              ) : conversations.length === 0 ? (
                <div className="text-center p-4 text-slate-500">No conversations yet</div>
              ) : (
                conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    className={`w-full text-left p-3 rounded-lg mb-1 text-sm hover:bg-slate-200 transition-colors ${
                      conversationId === conversation.id ? "bg-slate-200" : ""
                    }`}
                    onClick={() => handleSelectConversation(conversation.id)}
                  >
                    <div className="flex items-center">
                      <History className="h-4 w-4 mr-2 text-slate-500" />
                      <div className="truncate">{conversation.title}</div>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(conversation.updated_at).toLocaleDateString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-screen">
          <Card className="flex-1 flex flex-col overflow-hidden shadow-none border-0 rounded-none">
            <div className="p-4 bg-purple-600 text-white flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-white mr-3"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <History className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Masterin AI Tutor</h1>
                <p className="text-sm opacity-90">Your personal AI learning assistant</p>
              </div>
            </div>

            {/* Messages container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoadingMessages
                ? // Loading skeleton for messages
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[80%] rounded-lg p-3`}>
                        <Skeleton className={`h-${4 + index * 2} w-full max-w-md`} />
                      </div>
                    </div>
                  ))
                : messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-purple-100 text-gray-800"
                            : "bg-white border border-gray-200 shadow-sm"
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
                              {message.createdAt?.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              }) || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
      </div>
    </ProtectedRoute>
  )
}
