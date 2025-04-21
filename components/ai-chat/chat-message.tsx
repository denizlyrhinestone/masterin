import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"

type ChatMessageProps = {
  message: {
    id: string
    role: "user" | "assistant" | "system"
    content: string
    timestamp: Date
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex w-full items-start gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-8 w-8 bg-emerald-100">
          <AvatarFallback className="bg-emerald-100 text-emerald-700">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          isUser ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-800",
        )}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div className={cn("mt-1 text-right text-xs", isUser ? "text-emerald-100" : "text-gray-500")}>
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
