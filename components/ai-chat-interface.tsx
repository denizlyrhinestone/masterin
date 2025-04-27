"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Send, Bot, User, RefreshCw, ThumbsUp, ThumbsDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { v4 as uuidv4 } from "uuid"
import { type AIToolType, type ConversationMessage, sendChatMessage } from "@/lib/ai-service"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"

interface AIChatInterfaceProps {
  toolType: AIToolType
  systemPrompt: string
  placeholder?: string
  initialMessages?: ConversationMessage[]
  showAvatar?: boolean
  className?: string
  onResponse?: (response: string) => void
}

export default function AIChatInterface({
  toolType,
  systemPrompt,
  placeholder = "Type your message...",
  initialMessages = [],
  showAvatar = true,
  className,
  onResponse,
}: AIChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ConversationMessage[]>([
    { role: "system", content: systemPrompt },
    ...initialMessages,
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId] = useState(() => uuidv4())
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ConversationMessage = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      // Send message to API
      const response = await sendChatMessage(messages.concat(userMessage), {
        conversationId,
        toolType,
      })

      if (response.error) {
        throw response.error
      }

      // Add AI response to chat
      const assistantMessage: ConversationMessage = {
        role: "assistant",
        content: response.text,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Call onResponse callback if provided
      if (onResponse) {
        onResponse(response.text)
      }
    } catch (err) {
      console.error("Error generating response:", err)
      setError(err instanceof Error ? err.message : "Failed to generate response. Please try again.")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to generate response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = async () => {
    if (messages.length < 1 || isLoading) return

    // Get the last user message
    const lastUserMessageIndex = [...messages].reverse().findIndex((m) => m.role === "user")
    if (lastUserMessageIndex === -1) return

    const lastUserMessage = [...messages].reverse()[lastUserMessageIndex]

    // Remove the last assistant message if it exists
    const newMessages = messages.filter((_, index) => index !== messages.length - 1)
    setMessages(newMessages)

    // Retry with the last user message
    setIsLoading(true)
    setError(null)

    try {
      // Send message to API
      const response = await sendChatMessage(newMessages.concat({ role: "user", content: lastUserMessage.content }), {
        conversationId,
        toolType,
      })

      if (response.error) {
        throw response.error
      }

      const assistantMessage: ConversationMessage = {
        role: "assistant",
        content: response.text,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setInput("")

      if (onResponse) {
        onResponse(response.text)
      }
    } catch (err) {
      console.error("Error retrying response:", err)
      setError(err instanceof Error ? err.message : "Failed to generate response. Please try again.")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to generate response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages
          .filter((m) => m.role !== "system")
          .map((message, index) => (
            <div
              key={index}
              className={cn("flex items-start gap-3", message.role === "user" ? "justify-end" : "justify-start")}
            >
              {message.role === "assistant" && showAvatar && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <Card
                className={cn(
                  "max-w-[80%]",
                  message.role === "user" ? "bg-purple-600 text-white" : "bg-gray-100 dark:bg-gray-800",
                )}
              >
                <CardContent className="p-3">
                  {message.role === "assistant" ? (
                    <ReactMarkdown className="prose dark:prose-invert prose-sm max-w-none">
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p>{message.content}</p>
                  )}

                  {message.role === "assistant" && (
                    <div className="flex items-center justify-end mt-2 space-x-2 text-xs text-gray-500">
                      <span className="mr-1">Helpful?</span>
                      <button
                        onClick={() => {
                          toast({
                            title: "Feedback received",
                            description: "Thank you for your feedback!",
                          })
                        }}
                        className="p-1 rounded-full hover:bg-gray-200"
                        aria-label="Thumbs up"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => {
                          toast({
                            title: "Feedback received",
                            description: "Thank you for your feedback!",
                          })
                        }}
                        className="p-1 rounded-full hover:bg-gray-200"
                        aria-label="Thumbs down"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
              {message.role === "user" && showAvatar && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                  {user?.avatar_url && <AvatarImage src={user.avatar_url || "/placeholder.svg"} />}
                </Avatar>
              )}
            </div>
          ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            {showAvatar && (
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-purple-100 text-purple-600">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
            <Card className="max-w-[80%] bg-gray-100 dark:bg-gray-800">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm">Thinking...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3">
            {showAvatar && (
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-red-100 text-red-600">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
            <Card className="max-w-[80%] bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300">
              <CardContent className="p-3">
                <p className="text-sm">{error}</p>
                <Button variant="outline" size="sm" onClick={handleRetry} className="mt-2 text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" /> Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="flex-1 min-h-[60px] max-h-[200px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
