import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Bot, User, Loader2 } from "lucide-react"

type ChatMessageProps = {
  message: {
    id: string
    role: "user" | "assistant" | "system"
    content: string
    timestamp: Date
    status?: "sending" | "error" | "success"
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"
  const isSending = message.status === "sending"
  const isError = message.status === "error"

  return (
    <div className={cn("flex w-full items-start gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className={cn("h-8 w-8", isError ? "bg-red-100" : "bg-emerald-100")}>
          <AvatarFallback className={cn(isError ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700")}>
            <Bot className="h-4 w-4" />
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
            "mt-1 text-right text-xs",
            isUser ? "text-emerald-100" : isError ? "text-red-500" : "text-gray-500",
          )}
        >
          {formatTime(message.timestamp)}
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
