"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Send, PaperclipIcon, History, Plus, AlertTriangle } from "lucide-react"
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
import ErrorBoundary from "@/components/error-boundary"
import platformInfo from "@/lib/platform-info"

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

// Generate context-aware quick prompts based on the platform information
const generateQuickPrompts = () => {
  const allPrompts = [
    // Feature-related prompts
    ...platformInfo.features.map((feature) => `How does the ${feature.name} work?`),

    // Subject-related prompts
    ...platformInfo.subjects.map((subject) => `Can you help with ${subject.name}?`),

    // Pricing-related prompts
    "Tell me about your pricing plans",
    "What's included in the Premium plan?",

    // General prompts
    "How do I get started?",
    "What makes Masterin different?",
    "Can I try before subscribing?",
  ]

  // Randomly select 5 prompts
  const shuffled = [...allPrompts].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, 5)
}

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
  const [retryCount, setRetryCount] = useState(0)
  const [quickPrompts, setQuickPrompts] = useState<string[]>(generateQuickPrompts())

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
            // Refresh conversation list after creating a new one
            fetchConversations()
          }
        })
      }
    },
    onError: (error) => {
      console.error("Chat error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      })
    },
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Fetch conversations with error handling and retry logic
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return

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
      setRetryCount(0) // Reset retry count on success
    } catch (error) {
      console.error("Error fetching conversations:", error)

      // Implement exponential backoff for retries
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000
        setTimeout(() => {
          setRetryCount((prev) => prev + 1)
          fetchConversations()
        }, delay)
      } else {
        toast({
          title: "Error",
          description: "Failed to load your conversation history",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoadingConversations(false)
    }
  }, [isAuthenticated, toast, retryCount])

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(
    async (id: string) => {
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
    },
    [setMessages, toast],
  )

  // Delete conversation
  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase
          .from("chat_conversations")
          .update({ is_archived: true, archived_at: new Date().toISOString() })
          .eq("id", id)

        if (error) {
          throw error
        }

        // Remove from local state
        setConversations((prev) => prev.filter((conv) => conv.id !== id))

        // Redirect if the current conversation was deleted
        if (conversationId === id) {
          router.push("/ai/chat")
        }

        toast({
          title: "Conversation archived",
          description: "The conversation has been archived successfully",
        })
      } catch (error) {
        console.error("Error archiving conversation:", error)
        toast({
          title: "Error",
          description: "Failed to archive conversation",
          variant: "destructive",
        })
      }
    },
    [conversationId, router, toast],
  )

  // Fetch conversations on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations()
    }
  }, [isAuthenticated, fetchConversations])

  // Fetch messages for selected conversation
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId)
      // Generate new quick prompts when conversation changes
      setQuickPrompts(generateQuickPrompts())
    } else {
      const welcomeMessage = {
        id: "welcome",
        role: "assistant",
        content: `Hi there! I'm your AI tutor from ${platformInfo.name}. How can I help you with your learning today? Feel free to ask about any subject or how our platform can assist your educational journey.`,
      }
      setInitialMessages([welcomeMessage])
      setQuickPrompts(generateQuickPrompts())
    }
  }, [conversationId, fetchMessages])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleNewConversation = () => {
    router.push("/ai/chat")
    const welcomeMessage = {
      id: "welcome",
      role: "assistant",
      content: `Hi there! I'm your AI tutor from ${platformInfo.name}. How can I help you with your learning today? Feel free to ask about any subject or how our platform can assist your educational journey.`,
    }
    setMessages([welcomeMessage])
    // Generate new quick prompts for the new conversation
    setQuickPrompts(generateQuickPrompts())
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

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <ProtectedRoute>
      <ErrorBoundary>
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
                    <div key={conversation.id} className="relative group">
                      <button
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
                      <button
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteConversation(conversation.id)
                        }}
                        aria-label="Archive conversation"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Chat Area */}
          <div className="flex-1 flex flex-col h-screen">
            <Card className="flex-1 flex flex-col overflow-hidden shadow-none border-0 rounded-none">
              <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white mr-3"
                  onClick={() => setShowSidebar(!showSidebar)}
                >
                  <History className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold">{platformInfo.name} AI Tutor</h1>
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
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    {error.message || "An error occurred. Please try again."}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick prompts */}
              <div className="px-4 py-2 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Suggested topics:</p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, index) => (
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
                      placeholder="Ask anything about your studies or our platform..."
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
      </ErrorBoundary>
    </ProtectedRoute>
  )
}
