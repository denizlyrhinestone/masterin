"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send, MessageSquare, BookOpen, History, Plus, ArrowLeft } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import type { TutorResponse } from "@/lib/ai-service"
import { supabase } from "@/lib/supabase"

interface Message {
  id: string
  sender: "user" | "ai"
  content: string
  created_at: string
}

interface Session {
  id: string
  title: string
  subject: string | null
  created_at: string
  updated_at: string
}

export default function AITutorPage() {
  const router = useRouter()
  const { user, status } = useAuth()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("chat")
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [subject, setSubject] = useState("")
  const [userLevel, setUserLevel] = useState("intermediate")

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?redirect=/ai-tutor")
    }
  }, [status, router])

  // Fetch sessions
  useEffect(() => {
    if (status !== "authenticated" || !user) return

    async function fetchSessions() {
      try {
        const { data, error } = await supabase
          .from("ai_tutor_sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })

        if (error) throw error

        setSessions(data || [])

        // Set current session to the most recent one if none is selected
        if (!currentSessionId && data && data.length > 0) {
          setCurrentSessionId(data[0].id)
        }
      } catch (error) {
        console.error("Error fetching sessions:", error)
        toast({
          title: "Error",
          description: "Failed to load your chat sessions",
          variant: "destructive",
        })
      }
    }

    fetchSessions()
  }, [user, status, currentSessionId, toast])

  // Fetch messages for current session
  useEffect(() => {
    if (!currentSessionId) return

    async function fetchMessages() {
      try {
        const { data, error } = await supabase
          .from("ai_tutor_messages")
          .select("*")
          .eq("session_id", currentSessionId)
          .order("created_at", { ascending: true })

        if (error) throw error

        setMessages(data || [])
      } catch (error) {
        console.error("Error fetching messages:", error)
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        })
      }
    }

    fetchMessages()

    // Set up real-time subscription
    const subscription = supabase
      .channel(`ai_tutor_messages:session_id=eq.${currentSessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ai_tutor_messages",
          filter: `session_id=eq.${currentSessionId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages((prev) => [...prev, newMessage])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [currentSessionId, toast])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Create a new session
  const createNewSession = async () => {
    if (status !== "authenticated" || !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the AI Tutor",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("ai_tutor_sessions")
        .insert([
          {
            user_id: user.id,
            title: "New Conversation",
            subject: subject || null,
          },
        ])
        .select()
        .single()

      if (error) throw error

      setSessions((prev) => [data, ...prev])
      setCurrentSessionId(data.id)
      setMessages([])
      setActiveTab("chat")

      toast({
        title: "Success",
        description: "New conversation started",
      })
    } catch (error) {
      console.error("Error creating new session:", error)
      toast({
        title: "Error",
        description: "Failed to create new conversation",
        variant: "destructive",
      })
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!inputValue.trim()) return

    if (status !== "authenticated" || !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use the AI Tutor",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Create a session if none exists
      let sessionId = currentSessionId

      if (!sessionId) {
        const { data, error } = await supabase
          .from("ai_tutor_sessions")
          .insert([
            {
              user_id: user.id,
              title: inputValue.substring(0, 50) + (inputValue.length > 50 ? "..." : ""),
              subject: subject || null,
            },
          ])
          .select()
          .single()

        if (error) throw error

        sessionId = data.id
        setSessions((prev) => [data, ...prev])
        setCurrentSessionId(sessionId)
      }

      // Insert user message
      const { error: msgError } = await supabase.from("ai_tutor_messages").insert([
        {
          session_id: sessionId,
          content: inputValue,
          sender: "user",
        },
      ])

      if (msgError) throw msgError

      // Update session title if it's the first message
      if (messages.length === 0) {
        const title = inputValue.length > 30 ? inputValue.substring(0, 30) + "..." : inputValue

        await supabase
          .from("ai_tutor_sessions")
          .update({ title, updated_at: new Date().toISOString() })
          .eq("id", sessionId)

        setSessions((prev) => prev.map((session) => (session.id === sessionId ? { ...session, title } : session)))
      } else {
        // Just update the timestamp
        await supabase.from("ai_tutor_sessions").update({ updated_at: new Date().toISOString() }).eq("id", sessionId)
      }

      // Clear input
      setInputValue("")

      // Get AI response
      const response = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: inputValue,
          subject,
          userLevel,
          sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
  }

  const renderAIContent = (content: string) => {
    try {
      const parsedContent = JSON.parse(content) as TutorResponse

      return (
        <div className="space-y-4">
          <div className="whitespace-pre-wrap">{parsedContent.answer}</div>

          {parsedContent.relatedTopics && parsedContent.relatedTopics.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Related Topics</h4>
              <div className="flex flex-wrap gap-2">
                {parsedContent.relatedTopics.map((topic, index) => (
                  <Badge key={index} variant="secondary">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {parsedContent.resources && parsedContent.resources.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Additional Resources</h4>
              <ul className="space-y-2">
                {parsedContent.resources.map((resource, index) => (
                  <li key={index} className="text-sm">
                    <div className="font-medium">{resource.title}</div>
                    <div className="text-muted-foreground">{resource.description}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    } catch (e) {
      // If parsing fails, just return the content as is
      return <div className="whitespace-pre-wrap">{content}</div>
    }
  }

  if (status === "loading") {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-white">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden w-80 flex-shrink-0 border-r md:block">
          <div className="flex h-full flex-col">
            <div className="border-b p-4">
              <Button onClick={createNewSession} className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                New Conversation
              </Button>
            </div>

            <Tabs defaultValue="history" className="flex-1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="flex-1 overflow-auto p-4">
                {sessions.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No conversations yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Start a new conversation to get help from the AI Tutor
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <button
                        key={session.id}
                        className={`w-full rounded-md p-3 text-left text-sm transition-colors ${
                          currentSessionId === session.id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"
                        }`}
                        onClick={() => {
                          setCurrentSessionId(session.id)
                          setActiveTab("chat")
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 truncate font-medium">{session.title}</div>
                        </div>
                        <div className="mt-1 flex items-center text-xs text-muted-foreground">
                          <span>{formatDate(session.created_at)}</span>
                          {session.subject && (
                            <>
                              <span className="mx-2">•</span>
                              <Badge variant="outline" className="text-xs">
                                {session.subject}
                              </Badge>
                            </>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject (Optional)</Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Mathematics, Physics, History"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Specify a subject to get more relevant answers</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="level">Your Knowledge Level</Label>
                    <Select value={userLevel} onValueChange={setUserLevel}>
                      <SelectTrigger id="level">
                        <SelectValue placeholder="Select your level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      This helps the AI tutor adjust explanations to your level
                    </p>
                  </div>

                  <Button onClick={createNewSession} className="w-full mt-4">
                    Start New Conversation
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b">
              <div className="flex h-16 items-center px-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2 md:hidden"
                  onClick={() => setActiveTab(activeTab === "chat" ? "sessions" : "chat")}
                >
                  {activeTab === "chat" ? <History className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
                  <span className="sr-only">{activeTab === "chat" ? "Show sessions" : "Back to chat"}</span>
                </Button>
                <div className="flex-1">
                  <h1 className="text-xl font-semibold">AI Tutor</h1>
                  <p className="text-sm text-muted-foreground">Get personalized help with your questions</p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto hidden md:flex" onClick={createNewSession}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Conversation
                </Button>
              </div>
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 md:hidden">
                <TabsTrigger
                  value="chat"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Chat
                </TabsTrigger>
                <TabsTrigger
                  value="sessions"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  History
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Settings
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chat" className="flex-1 flex flex-col">
              {currentSessionId ? (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                    {messages.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center text-center">
                        <div className="rounded-full bg-blue-100 p-3">
                          <MessageSquare className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="mt-4 text-lg font-medium">Start a conversation</h3>
                        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                          Ask any question and get personalized help from the AI Tutor
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`flex max-w-[80%] ${
                              message.sender === "user" ? "flex-row-reverse" : "flex-row"
                            }`}
                          >
                            <div className="flex-shrink-0 mt-1">
                              {message.sender === "ai" ? (
                                <Avatar className="h-8 w-8 border border-slate-200">
                                  <AvatarImage src="/placeholder.svg?height=32&width=32&text=AI" alt="AI Tutor" />
                                  <AvatarFallback className="bg-blue-100 text-blue-600">AI</AvatarFallback>
                                </Avatar>
                              ) : (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={user?.user_metadata?.avatar_url || "/placeholder.svg?height=32&width=32"}
                                    alt={user?.user_metadata?.full_name || "User"}
                                  />
                                  <AvatarFallback>{user?.user_metadata?.full_name?.[0] || "U"}</AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                            <div
                              className={`mx-2 rounded-lg px-4 py-2 shadow-sm ${
                                message.sender === "user" ? "bg-blue-600 text-white" : "bg-white text-slate-800 border"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{message.sender === "user" ? "You" : "AI Tutor"}</span>
                                <span className="ml-auto text-xs opacity-70">{formatTime(message.created_at)}</span>
                              </div>
                              {message.sender === "user" ? (
                                <div className="whitespace-pre-wrap">{message.content}</div>
                              ) : (
                                renderAIContent(message.content)
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="border-t bg-white p-4">
                    <div className="flex items-end gap-2">
                      <Textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask your question here..."
                        className="min-h-[60px] flex-1 resize-none rounded-lg border-slate-200 focus-visible:ring-blue-500"
                        rows={2}
                      />
                      <Button
                        size="icon"
                        className="rounded-full bg-blue-600 hover:bg-blue-700"
                        onClick={sendMessage}
                        disabled={isLoading || !inputValue.trim()}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span className="sr-only">Send</span>
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center p-4">
                  <div className="rounded-full bg-blue-100 p-3">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">Welcome to AI Tutor</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                    Start a new conversation to get personalized help with your questions
                  </p>
                  <Button onClick={createNewSession} className="mt-6">
                    <Plus className="mr-2 h-4 w-4" />
                    New Conversation
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sessions" className="flex-1 overflow-auto p-4 md:hidden">
              {sessions.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No conversations yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Start a new conversation to get help from the AI Tutor
                  </p>
                  <Button onClick={createNewSession} className="mt-6">
                    <Plus className="mr-2 h-4 w-4" />
                    New Conversation
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button onClick={createNewSession} className="w-full justify-start gap-2 mb-4">
                    <Plus className="h-4 w-4" />
                    New Conversation
                  </Button>

                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      className={`w-full rounded-md p-3 text-left text-sm transition-colors ${
                        currentSessionId === session.id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"
                      }`}
                      onClick={() => {
                        setCurrentSessionId(session.id)
                        setActiveTab("chat")
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 truncate font-medium">{session.title}</div>
                      </div>
                      <div className="mt-1 flex items-center text-xs text-muted-foreground">
                        <span>{formatDate(session.created_at)}</span>
                        {session.subject && (
                          <>
                            <span className="mx-2">•</span>
                            <Badge variant="outline" className="text-xs">
                              {session.subject}
                            </Badge>
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="p-4 md:hidden">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile-subject">Subject (Optional)</Label>
                  <Input
                    id="mobile-subject"
                    placeholder="e.g., Mathematics, Physics, History"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Specify a subject to get more relevant answers</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile-level">Your Knowledge Level</Label>
                  <Select value={userLevel} onValueChange={setUserLevel}>
                    <SelectTrigger id="mobile-level">
                      <SelectValue placeholder="Select your level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    This helps the AI tutor adjust explanations to your level
                  </p>
                </div>

                <Button onClick={createNewSession} className="w-full mt-4">
                  Start New Conversation
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
