"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatBubble } from "./chat-bubble"
import { Send } from "lucide-react"
import { AnalyticsEvent } from "@/components/analytics-event"

interface AIChatWidgetProps {
  title?: string
  description?: string
}

const AIChatWidget: React.FC<AIChatWidgetProps> = ({ title = "AI Chat", description = "Ask me anything!" }) => {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [input, setInput] = useState("")
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom on new message
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: "user", content: input }
    setMessages((prevMessages) => [...prevMessages, userMessage])
    setInput("")

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse = { role: "assistant", content: `This is a simulated response to: ${input}` }
      setMessages((prevMessages) => [...prevMessages, aiResponse])
    }, 500)

    AnalyticsEvent("ai-chat-message-sent", { message: input })
  }

  return (
    <Card className="w-[400px] shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chatContainerRef} className="h-[300px] overflow-y-auto space-y-2 px-2">
          {messages.map((message, index) => (
            <ChatBubble key={index} role={message.role} content={message.content} />
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex items-center space-x-2">
        <Input
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage()
          }}
        />
        <Button onClick={handleSendMessage}>
          <Send className="h-4 w-4 mr-2" />
          Send
        </Button>
      </CardFooter>
    </Card>
  )
}

export default AIChatWidget
