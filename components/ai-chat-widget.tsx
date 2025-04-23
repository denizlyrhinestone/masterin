"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Send, Bot, User, ArrowRight } from "lucide-react"
import Link from "next/link"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function AIChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi there! I'm your AI tutor. How can I help you with your learning today?",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateQuickResponse(inputValue),
      }
      setMessages((prev) => [...prev, aiResponse])

      // Scroll to bottom again
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }, 1000)
  }

  // Let's enhance the generateQuickResponse function to provide more detailed responses

  // Replace the current generateQuickResponse function with this improved version:

  const generateQuickResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()

    // DNA and RNA related questions
    if (lowerInput.includes("dna") && !lowerInput.includes("rna")) {
      return "DNA (Deoxyribonucleic Acid) is the genetic material that carries instructions for development, functioning, growth, and reproduction of all known organisms. It has a double-helix structure made of nucleotides containing the bases Adenine, Thymine, Guanine, and Cytosine. For a more detailed explanation, please click the 'Open Full Chat' button below."
    }

    if (
      lowerInput.includes("dna") &&
      lowerInput.includes("rna") &&
      (lowerInput.includes("compare") || lowerInput.includes("contrast") || lowerInput.includes("difference"))
    ) {
      return "DNA and RNA differ in several ways: DNA is double-stranded with deoxyribose sugar and uses thymine, while RNA is usually single-stranded with ribose sugar and uses uracil instead of thymine. DNA stores genetic information, while RNA helps in protein synthesis. For a complete comparison, please click the 'Open Full Chat' button below."
    }

    if (lowerInput.includes("rna") && !lowerInput.includes("dna")) {
      return "RNA (Ribonucleic Acid) is a nucleic acid involved in protein synthesis. Unlike DNA, it's usually single-stranded and uses uracil instead of thymine. There are several types including mRNA, tRNA, and rRNA, each with specific functions. For more details, please click the 'Open Full Chat' button below."
    }

    // General greetings
    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return "Hello! I'm your AI tutor. What would you like to learn about today? I can help with mathematics, science, computer programming, and many other subjects."
    }

    if (lowerInput.includes("help")) {
      return "I'd be happy to help you learn! I can explain concepts, solve problems, and answer questions on many academic subjects. For a better experience with more detailed answers, please click the 'Open Full Chat' button below."
    }

    // Default response for other questions
    return "That's an interesting question! To provide a more detailed and helpful answer, please click the 'Open Full Chat' button below where I can give you a comprehensive explanation with examples."
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardHeader className="bg-purple-600 text-white p-4 cursor-pointer" onClick={toggleExpand}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
              <Bot className="w-4 h-4 text-purple-600" />
            </div>
            <CardTitle className="text-lg">AI Tutor</CardTitle>
          </div>
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
        </div>
      </CardHeader>

      {isExpanded && (
        <>
          <CardContent className="p-4 h-[300px] overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === "user"
                          ? "bg-purple-100 dark:bg-purple-900/30 ml-2"
                          : "bg-blue-100 dark:bg-blue-900/30 mr-2"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="w-3 h-3 text-purple-600" />
                      ) : (
                        <Bot className="w-3 h-3 text-blue-600" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg p-3 text-sm ${
                        message.role === "user" ? "bg-purple-600 text-white" : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          <CardFooter className="p-3 border-t">
            <form onSubmit={handleSubmit} className="flex w-full space-x-2">
              <Input
                type="text"
                placeholder="Ask a question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-grow text-sm"
              />
              <Button type="submit" size="sm" disabled={!inputValue.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardFooter>
        </>
      )}

      <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t text-center">
        <Link href="/ai/chat">
          <Button variant="outline" size="sm" className="w-full">
            Open Full Chat <ArrowRight className="ml-2 w-3 h-3" />
          </Button>
        </Link>
      </div>
    </Card>
  )
}
