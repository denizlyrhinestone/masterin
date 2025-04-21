import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Bot, User, Loader2, AlertCircle, WifiOff, Info } from "lucide-react"

type ChatMessageProps = {
  message: {
    id: string
    role: "user" | "assistant" | "system"
    content: string
    timestamp: Date
    status?: "sending" | "error" | "success"
    isFallback?: boolean
    errorCode?: string
    provider?: string
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const isSending = message.status === "sending"
  const isError = message.status === "error"
  const isFallback = message.isFallback

  const getErrorLabel = (code?: string) => {
    if (!code) return null

    const errorLabels: Record<string, string> = {
      RATE_LIMITED: "Rate Limited",
      TIMEOUT: "Timeout",
      CONTEXT_LENGTH_EXCEEDED: "Context Too Long",
      CONNECTIVITY_FAILURE: "Connectivity Issue",
      SERVICE_COOLDOWN: "Service Cooldown",
      OFFLINE_MODE: "Offline Mode",
      REQUEST_FAILED: "Request Failed",
      GENERAL_ERROR: "Service Issue",
      INVALID_API_KEY: "Configuration Error",
      NO_MODEL_AVAILABLE: "No Model Available",
    }

    return errorLabels[code] || code
  }

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
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {isFallback && message.errorCode && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs py-0 h-5",
                  isError ? "border-red-200 text-red-700 bg-red-50" : "border-amber-200 text-amber-700 bg-amber-50",
                )}
              >
                <Info className="h-3 w-3 mr-1" />
                {getErrorLabel(message.errorCode)}
              </Badge>
            )}
            {message.provider && !isUser && (
              <Badge variant="outline" className="text-xs py-0 h-5 border-emerald-200 text-emerald-700 bg-emerald-50">
                {message.provider}
              </Badge>
            )}
          </div>
          <div
            className={cn(
              "text-right text-xs flex items-center justify-end",
              isUser ? "text-emerald-100" : isError ? "text-red-500" : isFallback ? "text-amber-500" : "text-gray-500",
            )}
          >
            {formatTime(message.timestamp)}
          </div>
        </div>
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
