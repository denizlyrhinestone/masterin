"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Send, Bot, User, Loader2 } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import FileUploadWithDrawing from "@/components/file-upload-with-drawing"
import DrawingMessage from "@/components/drawing-message"
import type { UploadedFile } from "@/lib/file-upload"

type MessageType = "text" | "drawing" | "file"

interface Message {
  id: string
  role: "user" | "assistant"
  type: MessageType
  content: string
  isLoading?: boolean
  fileData?: UploadedFile
}

export default function AIChat() {
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      type: "text",
      content:
        "Hi there! I'm your AI tutor. How can I help you today? You can send me text messages, files, or even create drawings to explain your questions.",
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      type: "text",
      content: inputValue.trim(),
    }

    // Add a loading message from the assistant
    const loadingMessage: Message = {
      id: uuidv4(),
      role: "assistant",
      type: "text",
      content: "",
      isLoading: true,
    }

    setMessages((prev) => [...prev, userMessage, loadingMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      // Remove the loading message
      setMessages((prev) => prev.filter((msg) => !msg.isLoading))

      // Add the response as an assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          type: "text",
          content: generateResponse(userMessage.content),
        },
      ])

      setIsTyping(false)
    }, 1500)
  }

  const handleFileUploaded = (file: UploadedFile) => {
    // Add user file message
    const fileMessage: Message = {
      id: uuidv4(),
      role: "user",
      type: "file",
      content: `Uploaded file: ${file.filename}`,
      fileData: file,
    }

    // Add a loading message from the assistant
    const loadingMessage: Message = {
      id: uuidv4(),
      role: "assistant",
      type: "text",
      content: "",
      isLoading: true,
    }

    setMessages((prev) => [...prev, fileMessage, loadingMessage])
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      // Remove the loading message
      setMessages((prev) => prev.filter((msg) => !msg.isLoading))

      // Add the response as an assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          type: "text",
          content: `I've received your file "${file.filename}". What would you like me to help you with regarding this file?`,
        },
      ])

      setIsTyping(false)
    }, 1500)
  }

  const handleDrawingUploaded = (imageData: string) => {
    // Add user drawing message
    const drawingMessage: Message = {
      id: uuidv4(),
      role: "user",
      type: "drawing",
      content: imageData,
    }

    // Add a loading message from the assistant
    const loadingMessage: Message = {
      id: uuidv4(),
      role: "assistant",
      type: "text",
      content: "",
      isLoading: true,
    }

    setMessages((prev) => [...prev, drawingMessage, loadingMessage])
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      // Remove the loading message
      setMessages((prev) => prev.filter((msg) => !msg.isLoading))

      // Add the response as an assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          type: "text",
          content:
            "I've received your drawing. Could you explain what you've drawn or what you'd like me to help you with?",
        },
      ])

      setIsTyping(false)
    }, 1500)
  }

  // Simple response generator
  const generateResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return "Hello! How can I help you with your learning today?"
    }

    if (lowerInput.includes("draw")) {
      return "You can create drawings using the pencil icon next to the attachment button. It's a great way to visualize concepts or problems you're working on."
    }

    if (lowerInput.includes("math") || lowerInput.includes("equation")) {
      return "I can help with math problems! You can type your question or use the drawing tool to sketch the problem if it contains complex equations or diagrams."
    }

    return "I understand your question. To better assist you, feel free to use the drawing tool if you need to illustrate your point or show me a specific problem."
  }

  // Render message content based on type
  const renderMessageContent = (message: Message) => {
    if (message.isLoading) {
      return (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Thinking...</span>
        </div>
      )
    }

    switch (message.type) {
      case "text":
        return <div className="whitespace-pre-line">{message.content}</div>

      case "drawing":
        return <DrawingMessage imageData={message.content} alt="User drawing" />

      case "file":
        if (message.fileData) {
          const { fileType, contentType, url, filename } = message.fileData

          if (fileType === "image") {
            return (
              <div>
                <img src={url || "/placeholder.svg"} alt={filename} className="max-h-60 rounded-md" />
                <div className="mt-1 text-xs text-gray-500">{filename}</div>
              </div>
            )
          }

          return (
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <p className="text-sm font-medium truncate">{filename}</p>
                <p className="text-xs text-gray-500">{contentType}</p>
              </div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-purple-600 hover:text-purple-800 text-sm"
              >
                View
              </a>
            </div>
          )
        }
        return <div>{message.content}</div>
    }
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
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === "user"
                      ? "bg-purple-100 dark:bg-purple-900/30 ml-2"
                      : "bg-blue-100 dark:bg-blue-900/30 mr-2"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4 text-purple-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-purple-600 text-white"
                      : message.isLoading
                        ? "bg-gray-100 dark:bg-gray-800 animate-pulse"
                        : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  {renderMessageContent(message)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form */}
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a question..."
              className="min-h-[80px]"
              disabled={isTyping}
            />
            <div className="flex justify-between items-center">
              <FileUploadWithDrawing
                onFileUploaded={handleFileUploaded}
                onDrawingUploaded={handleDrawingUploaded}
                disabled={isTyping}
              />
              <Button type="submit" disabled={!inputValue.trim() || isTyping}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
