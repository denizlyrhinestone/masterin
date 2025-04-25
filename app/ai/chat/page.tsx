"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"

// Extremely minimal version to isolate the build issue
export default function AIChat() {
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState([
    { id: "welcome", content: "Hi there! I'm your AI tutor. How can I help you today?" },
  ])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Add user message
    setMessages((prev) => [...prev, { id: Date.now().toString(), content: inputValue.trim() }])

    // Add AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: "This is a placeholder response.",
        },
      ])
    }, 500)

    setInputValue("")
  }

  return (
    <div className="flex flex-col h-screen">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 bg-purple-600 text-white">
          <h1 className="text-xl font-bold">AI Tutor</h1>
        </div>

        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="p-3 border rounded-lg">
              {message.content}
            </div>
          ))}
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1"
            />
            <Button type="submit">Send</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
