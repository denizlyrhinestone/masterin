"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Send, ThumbsUp, ThumbsDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useChat } from "@ai-sdk/react"

interface Message {
  role: "user" | "assistant"
  content: string
  id: string
}

interface AITutorProps {
  initialMessages?: Message[]
  userId?: string
}

// Export as both default and named export
export function AiTutor({ initialMessages = [], userId = "anonymous" }: AITutorProps) {
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [feedbackId, setFeedbackId] = useState<string | null>(null)

  // Use the AI SDK's useChat hook with proper error handling
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload, stop } = useChat({
    api: "/api/ai-tutor",
    initialMessages,
    body: { user: { id: userId } },
    onError: (error) => {
      console.error("AI chat error:", error)
      toast({
        title: "Error",
        description: "There was a problem connecting to the AI tutor. Please try again.",
        variant: "destructive",
      })
    },
    onFinish: () => {
      // Scroll to bottom when finished
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    },
  })

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle feedback submission
  const handleFeedback = async (messageId: string, isPositive: boolean) => {
    if (feedbackId === messageId) return // Prevent duplicate submissions

    setFeedbackId(messageId)

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId,
          isPositive,
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit feedback")
      }

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      })
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
      setFeedbackId(null) // Reset to allow retry
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">AI Tutor</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] overflow-y-auto">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">
              Ask me anything about your studies and I'll do my best to help!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>

                {message.role === "assistant" && (
                  <div className="flex items-center mt-1 space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleFeedback(message.id, true)}
                      disabled={feedbackId === message.id}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="sr-only">Good response</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleFeedback(message.id, false)}
                      disabled={feedbackId === message.id}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span className="sr-only">Bad response</span>
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error state with retry button */}
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-lg p-4 my-4">
            <p className="font-medium">Something went wrong</p>
            <p className="text-sm mt-1">The AI tutor encountered an error. Please try again.</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => reload()}>
              Retry
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            placeholder="Ask a question..."
            value={input}
            onChange={handleInputChange}
            disabled={isLoading || !!error}
            className="flex-1"
          />
          {isLoading ? (
            <Button disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="sr-only">Loading</span>
            </Button>
          ) : (
            <Button type="submit" disabled={!input.trim() || !!error}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          )}

          {isLoading && (
            <Button type="button" variant="outline" size="icon" onClick={() => stop()}>
              <span className="sr-only">Stop generating</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <rect x="6" y="6" width="12" height="12" />
              </svg>
            </Button>
          )}
        </form>
      </CardFooter>
    </Card>
  )
}

// Also export as default for convenience
export default AiTutor
