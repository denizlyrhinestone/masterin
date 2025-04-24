"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Send, PaperclipIcon, History, Plus, X, Loader2, AlertCircle } from "lucide-react"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import ErrorBoundary from "@/components/error-boundary"
import platformInfo from "@/lib/platform-info"
import { uploadFile } from "@/lib/file-upload"
import { v4 as uuidv4 } from "uuid"
import { getGuestConversations, getGuestMessages, saveGuestMessages, updateGuestConversation } from "@/lib/guest-user"

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
  attachments?: Attachment[]
}

type Attachment = {
  id: string
  url: string
  filename: string
  fileType: string
  contentType: string
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

// Helper function to get guest conversations from localStorage

// Helper function to save guest conversations to localStorage
const saveGuestConversations = (conversations: Conversation[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("guest_conversations", JSON.stringify(conversations))
  }
}

// Helper function to get guest messages from localStorage

// Helper function to save guest messages to localStorage

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
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [guestId] = useState(() => `guest-${uuidv4()}`)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, append, reload, setMessages } = useChat({
    api: "/api/chat",
    body: {
      conversationId,
      attachments: pendingAttachments,
      guestId: !isAuthenticated ? guestId : undefined,
    },
    initialMessages,
    onResponse: (response) => {
      // Add error handling here
      if (!response.ok) {
        toast({
          title: "Error",
          description: `Failed to get response: ${response.statusText || "Unknown error"}`,
          variant: "destructive",
        })
        return
      }

      // Extract conversation ID from the response
      const data = response.json()
      data
        .then((json) => {
          if (json.conversationId && !conversationId) {
            router.push(`/ai/chat?id=${json.conversationId}`)
            // Refresh conversation list after creating a new one
            if (isAuthenticated) {
              fetchConversations()
            } else {
              // For guest users, update local storage
              updateGuestConversation(json.conversationId, messages[0]?.content || "New conversation")
            }
          }
        })
        .catch((err) => {
          console.error("Error parsing response JSON:", err)
        })
    },
    onError: (err) => {
      console.error("Chat error:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to send message. Please try again.",
        variant: "destructive",
      })
    },
    onFinish: (message) => {
      // Clear pending attachments after message is sent
      setPendingAttachments([])

      // For guest users, save messages to localStorage
      if (!isAuthenticated && conversationId) {
        try {
          const updatedMessages = [
            ...messages,
            {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: message.content,
              createdAt: new Date(),
            },
          ]
          saveGuestMessages(conversationId, updatedMessages)
        } catch (error) {
          console.error("Error saving guest messages:", error)
        }
      }
    },
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Update guest conversation in localStorage
  const updateGuestConversation = (id: string, title: string) => {
    const existingConversations = getGuestConversations()
    const now = new Date().toISOString()

    // Check if conversation already exists
    const existingIndex = existingConversations.findIndex((c) => c.id === id)

    if (existingIndex >= 0) {
      // Update existing conversation
      existingConversations[existingIndex] = {
        ...existingConversations[existingIndex],
        title: title.slice(0, 50) + (title.length > 50 ? "..." : ""),
        updated_at: now,
      }
    } else {
      // Add new conversation
      existingConversations.push({
        id,
        title: title.slice(0, 50) + (title.length > 50 ? "..." : ""),
        updated_at: now,
      })
    }

    // Save updated conversations
    saveGuestConversations(existingConversations)

    // Update state
    setConversations(existingConversations)
  }

  // Fetch conversations with error handling and retry logic
  const fetchConversations = useCallback(async () => {
    setIsLoadingConversations(true)

    if (!isAuthenticated) {
      // For guest users, get conversations from localStorage
      const guestConversations = getGuestConversations()
      setConversations(guestConversations)
      setIsLoadingConversations(false)
      return
    }

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

      if (!isAuthenticated) {
        // For guest users, get messages from localStorage
        const guestMessages = getGuestMessages(id)
        setInitialMessages(guestMessages)
        setMessages(guestMessages)
        setIsLoadingMessages(false)
        return
      }

      try {
        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("conversation_id", id)
          .order("created_at", { ascending: true })

        if (messagesError) {
          throw messagesError
        }

        // Fetch attachments for messages
        const messageIds = messagesData.filter((msg) => msg.has_attachments).map((msg) => msg.id)

        let attachmentsData: any[] = []
        if (messageIds.length > 0) {
          const { data: fetchedAttachments, error: attachmentsError } = await supabase
            .from("message_attachments")
            .select("*")
            .in("message_id", messageIds)

          if (attachmentsError) {
            console.error("Error fetching attachments:", attachmentsError)
          } else {
            attachmentsData = fetchedAttachments || []
          }
        }

        // Format messages for the chat component
        const formattedMessages = messagesData.map((msg) => {
          // Find attachments for this message
          const msgAttachments = attachmentsData
            .filter((att) => att.message_id === msg.id)
            .map((att) => ({
              id: att.file_id,
              url: att.file_url,
              filename: att.filename,
              fileType: att.file_type,
              contentType: att.content_type,
            }))

          return {
            id: msg.id,
            role: msg.role as "user" | "assistant" | "system",
            content: msg.content,
            createdAt: new Date(msg.created_at),
            attachments: msgAttachments.length > 0 ? msgAttachments : undefined,
          }
        })

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
    [setMessages, toast, isAuthenticated],
  )

  // Delete conversation
  const deleteConversation = useCallback(
    async (id: string) => {
      if (!isAuthenticated) {
        // For guest users, remove from localStorage
        const existingConversations = getGuestConversations()
        const updatedConversations = existingConversations.filter((c) => c.id !== id)
        saveGuestConversations(updatedConversations)
        setConversations(updatedConversations)

        // Remove messages
        if (typeof window !== "undefined") {
          localStorage.removeItem(`guest_messages_${id}`)
        }

        // Redirect if the current conversation was deleted
        if (conversationId === id) {
          router.push("/ai/chat")
        }

        toast({
          title: "Conversation deleted",
          description: "The conversation has been deleted successfully",
        })

        return
      }

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
    [conversationId, router, toast, isAuthenticated],
  )

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

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
    // Clear any pending attachments
    setPendingAttachments([])

    // Show a welcome toast for new users
    if (!isAuthenticated) {
      toast({
        title: "Welcome to Full Chat!",
        description: "Enjoy unlimited conversations with our AI tutor - completely free!",
      })
    }
  }

  const handleSelectConversation = (id: string) => {
    router.push(`/ai/chat?id=${id}`)
    // Clear any pending attachments
    setPendingAttachments([])
  }

  const handleQuickPrompt = (prompt: string) => {
    append({
      role: "user",
      content: prompt,
    })

    // For guest users, save the message to localStorage
    if (!isAuthenticated && conversationId) {
      const newMessage = {
        id: `user-${Date.now()}`,
        role: "user" as const,
        content: prompt,
        createdAt: new Date(),
      }

      const updatedMessages = [...messages, newMessage]
      saveGuestMessages(conversationId, updatedMessages)

      // Update conversation title if this is the first message
      if (messages.length === 1 && messages[0].role === "assistant") {
        updateGuestConversation(conversationId, prompt)
      }
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      })
      return
    }

    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "text/plain",
      "text/csv",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
    ]

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload an image, PDF, text, CSV, Word, or Excel file",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Upload the file
      const uploadedFile = await uploadFile(file)

      // Add to pending attachments
      setPendingAttachments((prev) => [
        ...prev,
        {
          id: uploadedFile.id,
          url: uploadedFile.url,
          filename: file.name,
          fileType: file.type.split("/")[0],
          contentType: file.type,
        },
      ])

      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully`,
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Remove a pending attachment
  const handleRemoveAttachment = (fileId: string) => {
    setPendingAttachments((prev) => prev.filter((file) => file.id !== fileId))
  }

  // Custom submit handler to include attachments
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Don't submit if there's no input and no attachments
    if (!input.trim() && pendingAttachments.length === 0) return

    // Create message content
    let messageContent = input.trim()

    // Add file descriptions to the message if there are attachments
    if (pendingAttachments.length > 0 && !messageContent) {
      messageContent = `I've attached ${pendingAttachments.length} file${pendingAttachments.length > 1 ? "s" : ""} for analysis.`
    }

    // For guest users, save the message to localStorage
    if (!isAuthenticated && conversationId) {
      const newMessage = {
        id: `user-${Date.now()}`,
        role: "user" as const,
        content: messageContent,
        createdAt: new Date(),
        attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined,
      }

      const updatedMessages = [...messages, newMessage]
      saveGuestMessages(conversationId, updatedMessages)

      // Update conversation title if this is the first message
      if (messages.length === 1 && messages[0].role === "assistant") {
        updateGuestConversation(conversationId, messageContent)
      }
    }

    // Call the original submit handler
    handleSubmit(e)
  }

  useEffect(() => {
    // Check if there's an API error and show a recoverable UI
    if (error) {
      console.error("API Error:", error)

      // Show toast for errors
      toast({
        title: "Connection Issue",
        description: "Having trouble connecting to the AI service. We'll try again.",
        variant: "destructive",
      })

      // Implement automatic retry after a few seconds for non-critical errors
      if (retryCount < 2) {
        const timer = setTimeout(() => {
          setRetryCount((prev) => prev + 1)
          reload() // Attempt to reload the conversation
        }, 3000)

        return () => clearTimeout(timer)
      }
    }
  }, [error, retryCount, reload, toast])

  return (
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

            {/* Free Access Banner */}
            <div className="bg-green-50 dark:bg-green-900/20 p-3 border-b border-green-100 dark:border-green-800">
              <div className="flex items-center justify-center text-sm text-green-800 dark:text-green-300">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Full chat experience now available to all users - no subscription required!</span>
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

                            {/* Display attachments if any */}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((attachment) => (
                                  <div
                                    key={attachment.id}
                                    className="flex items-center p-2 rounded bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                  >
                                    <div className="mr-2 text-gray-500">
                                      {attachment.fileType === "image" ? (
                                        <img
                                          src={attachment.url || "/placeholder.svg"}
                                          alt={attachment.filename}
                                          className="max-h-40 max-w-full rounded"
                                        />
                                      ) : attachment.fileType === "application" ? (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                          />
                                        </svg>
                                      ) : (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                          />
                                        </svg>
                                      )}
                                    </div>
                                    <div className="flex-1 truncate text-sm">{attachment.filename}</div>
                                    <a
                                      href={attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-2 text-purple-600 hover:text-purple-800"
                                    >
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                        />
                                      </svg>
                                    </a>
                                  </div>
                                ))}
                              </div>
                            )}

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
              {error && retryCount >= 2 && (
                <Alert variant="destructive" className="my-4 mx-auto max-w-md">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {error.message || "An error occurred. Please try again."}
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRetryCount(0)
                          reload()
                        }}
                      >
                        Try Again
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
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

            {/* Pending attachments */}
            {pendingAttachments.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Attachments:</p>
                <div className="flex flex-wrap gap-2">
                  {pendingAttachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center p-2 rounded bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="mr-2 text-gray-500">
                        {attachment.fileType === "image" ? (
                          <img
                            src={attachment.url || "/placeholder.svg"}
                            alt={attachment.filename}
                            className="h-8 w-8 object-cover rounded"
                          />
                        ) : attachment.fileType === "application" ? (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 truncate text-sm">{attachment.filename}</div>
                      <button
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        className="ml-2 text-gray-500 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input form */}
            <form onSubmit={handleCustomSubmit} className="p-4 border-t border-gray-200">
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
                        handleCustomSubmit(e)
                      }
                    }}
                    disabled={isLoading || isUploading}
                  />
                  <button
                    type="button"
                    onClick={handleFileUpload}
                    className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600"
                    disabled={isLoading || isUploading}
                  >
                    {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <PaperclipIcon className="h-5 w-5" />}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/jpeg,image/png,image/gif,application/pdf,text/plain,text/csv,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || isUploading || (!input.trim() && pendingAttachments.length === 0)}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  )
}
