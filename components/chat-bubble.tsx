import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"

interface ChatBubbleProps {
  content: string
  sender: "user" | "ai"
  timestamp?: string
  avatar?: string
  className?: string
}

export function ChatBubble({ content, sender, timestamp, avatar, className }: ChatBubbleProps) {
  const isUser = sender === "user"

  return (
    <div className={cn("flex w-full gap-3 my-4", isUser ? "justify-end" : "justify-start", className)}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <img src={avatar || "/ai-tutor-chat.png"} alt="AI" className="h-full w-full object-cover" />
        </Avatar>
      )}

      <Card
        className={cn("px-4 py-3 max-w-[80%] rounded-xl", isUser ? "bg-primary text-primary-foreground" : "bg-muted")}
      >
        <div className="whitespace-pre-wrap break-words">{content}</div>
        {timestamp && (
          <div className={cn("text-xs mt-1", isUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
            {timestamp}
          </div>
        )}
      </Card>

      {isUser && (
        <Avatar className="h-8 w-8">
          <img src={avatar || "/focused-student.png"} alt="User" className="h-full w-full object-cover" />
        </Avatar>
      )}
    </div>
  )
}
