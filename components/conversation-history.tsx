"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { PlusCircle, MessageSquare, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ConversationSession {
  id: string
  title: string
  updatedAt: string
}

interface ConversationHistoryProps {
  userId: string
  onSelectSession: (sessionId: string) => void
  onNewSession: () => void
  currentSessionId?: string | null
}

export function ConversationHistory({
  userId,
  onSelectSession,
  onNewSession,
  currentSessionId,
}: ConversationHistoryProps) {
  const [sessions, setSessions] = useState<ConversationSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/ai-tutor/sessions?userId=${userId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch sessions")
        }

        const data = await response.json()
        setSessions(data.sessions || [])
      } catch (error) {
        console.error("Error fetching sessions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [userId])

  // Delete session
  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    try {
      const response = await fetch(`/api/ai-tutor/sessions/${sessionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete session")
      }

      setSessions(sessions.filter((session) => session.id !== sessionId))

      // If the current session was deleted, create a new one
      if (currentSessionId === sessionId) {
        onNewSession()
      }
    } catch (error) {
      console.error("Error deleting session:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Conversations</h3>
        <Button variant="ghost" size="sm" onClick={onNewSession}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New
        </Button>
      </div>

      <ScrollArea className="h-[300px]">
        <div className="space-y-2 pr-4">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-2 rounded-lg p-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No conversation history yet</div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center space-x-2 rounded-lg p-2 cursor-pointer hover:bg-muted transition-colors ${
                  currentSessionId === session.id ? "bg-muted" : ""
                }`}
                onClick={() => onSelectSession(session.id)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => handleDeleteSession(session.id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
