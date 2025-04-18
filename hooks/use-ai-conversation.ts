"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import type { Message } from "ai"

interface UseAIConversationProps {
  initialMessages?: Message[]
  sessionId?: string
  userId?: string
  subject?: string
}

interface UseAIConversationReturn {
  messages: Message[]
  input: string
  setInput: (input: string) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  error: string | null
  modelInfo: {
    provider: string
    model: string
  }
  sessionId: string | null
  resetConversation: () => void
}

export function useAIConversation({
  initialMessages = [],
  sessionId: initialSessionId,
  userId = "anonymous",
  subject,
}: UseAIConversationProps = {}): UseAIConversationReturn {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modelInfo, setModelInfo] = useState({ provider: "", model: "" })
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null)

  // Create a new session if needed
  useEffect(() => {
    const createSession = async () => {
      if (!sessionId) {
        try {
          const response = await fetch("/api/ai-tutor/sessions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
              subject,
            }),
          })

          if (!response.ok) {
            throw new Error("Failed to create session")
          }

          const data = await response.json()
          setSessionId(data.id)
        } catch (err) {
          setError("Failed to create conversation session")
          console.error(err)
        }
      }
    }

    createSession()
  }, [sessionId, userId, subject])

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!input.trim() || isLoading) return

      setIsLoading(true)
      setError(null)

      // Add user message to chat
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: input,
      }

      const newMessages = [...messages, userMessage]
      setMessages(newMessages)
      setInput("")

      try {
        // Call the AI tutor API
        const response = await fetch("/api/ai-tutor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: newMessages,
            userId,
            subject,
            sessionId,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to get response from AI tutor")
        }

        const data = await response.json()

        // Update model info if available
        if (data.provider && data.model) {
          setModelInfo({
            provider: data.provider,
            model: data.model,
          })
        }

        // Add AI response to chat
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.content,
        }

        setMessages([...newMessages, assistantMessage])

        // Update the session with the new messages
        if (sessionId) {
          await fetch(`/api/ai-tutor/sessions/${sessionId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: [...newMessages, assistantMessage],
            }),
          })
        }
      } catch (err) {
        console.error("Error:", err)
        setError("Failed to get response from AI tutor")

        // Add error message to chat
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again later.",
        }

        setMessages([...newMessages, errorMessage])
      } finally {
        setIsLoading(false)
      }
    },
    [input, isLoading, messages, userId, subject, sessionId],
  )

  // Reset conversation
  const resetConversation = useCallback(async () => {
    setMessages([])
    setInput("")
    setError(null)

    // Create a new session
    try {
      const response = await fetch("/api/ai-tutor/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          subject,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create session")
      }

      const data = await response.json()
      setSessionId(data.id)
    } catch (err) {
      setError("Failed to create conversation session")
      console.error(err)
    }
  }, [userId, subject])

  return {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    error,
    modelInfo,
    sessionId,
    resetConversation,
  }
}
