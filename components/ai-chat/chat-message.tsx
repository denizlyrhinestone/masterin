"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Bot, User, Loader2, AlertCircle, WifiOff, Info } from "lucide-react"
import { useState } from "react"

type ChatMessageProps = {
  message: {
    id: string
    role: "user" | "assistant" | "system"
    content: string
    timestamp: Date
    status?: "sending" | "error" | "success"
    isFallback?: boolean
    diagnostics?: any
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const isUser = message.role === "user"
  const isSending = message.status === "sending"
  const isError = message.status === "error"
  const isFallback = message.isFallback
  const hasDiagnostics = message.diagnostics && Object.keys(message.diagnostics).length > 0

  return (
    <div className={cn("flex w-full items-start gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className={cn("h-8 w-8", isError ? "bg-red-100" : isFallback ? "bg-amber-100" : "bg-emerald-100")}>
          <AvatarFallback
            className={cn(
              isError
                ? "bg-red-100 text-red-700"
                : isFallback
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700",
            )}
          >
            {isError ? (
              <AlertCircle className="h-4 w-4" />
            ) : isFallback ? (
              <WifiOff className="h-4 w-4" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2 transition-all duration-200",
          isUser
            ? "bg-emerald-600 text-white"
            : isError
              ? "bg-red-50 text-red-800 border border-red-200"
              : isFallback
                ? "bg-amber-50 text-amber-800 border border-amber-200"
                : "bg-gray-100 text-gray-800",
          isSending && "animate-pulse",
        )}
      >
        <div className="whitespace-pre-wrap">
          {message.content}
          {isSending && (
            <span className="inline-flex items-center ml-2">
              <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
            </span>
          )}
        </div>
        <div
          className={cn(
            "mt-1 text-right text-xs flex items-center justify-end gap-1",
            isUser ? "text-emerald-100" : isError ? "text-red-500" : isFallback ? "text-amber-500" : "text-gray-500",
          )}
        >
          {isFallback && <WifiOff className="h-3 w-3" />}
          {hasDiagnostics && (
            <button onClick={() => setShowDiagnostics(!showDiagnostics)} className="hover:underline flex items-center">
              <Info className="h-3 w-3 mr-1" />
              {showDiagnostics ? "Hide info" : "Show info"}
            </button>
          )}
          <span className="ml-1">{formatTime(message.timestamp)}</span>
        </div>

        {showDiagnostics && hasDiagnostics && (
          <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
            <div className="grid grid-cols-2 gap-1">
              <div>Provider:</div>
              <div className="font-medium">{message.diagnostics.provider || "unknown"}</div>

              {message.diagnostics.responseTime && (
                <>
                  <div>Response time:</div>
                  <div className="font-medium">{message.diagnostics.responseTime}ms</div>
                </>
              )}

              {message.diagnostics.successRate !== undefined && (
                <>
                  <div>Success rate:</div>
                  <div className="font-medium">{message.diagnostics.successRate}%</div>
                </>
              )}

              {message.diagnostics.openAIKeyValidated !== undefined && (
                <>
                  <div>API key status:</div>
                  <div
                    className={
                      message.diagnostics.openAIKeyValidated ? "text-green-600 font-medium" : "text-red-600 font-medium"
                    }
                  >
                    {message.diagnostics.openAIKeyValidated ? "Valid" : "Invalid"}
                  </div>
                </>
              )}

              {message.diagnostics.errorType && (
                <>
                  <div>Error type:</div>
                  <div className="font-medium text-red-600">{message.diagnostics.errorType}</div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 bg-gray-200">
          <AvatarFallback className="bg-gray-200 text-gray-700">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date)
}
