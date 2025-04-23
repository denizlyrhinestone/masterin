"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Sparkles, BookOpen, Lightbulb, Info, Send, PaperclipIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"

// Message type definition
type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  status: "sending" | "sent" | "error"
}

// Sample subjects for quick prompts
const sampleSubjects = [
  { name: "Mathematics", icon: <BookOpen className="w-4 h-4" /> },
  { name: "Physics", icon: <Sparkles className="w-4 h-4" /> },
  { name: "Computer Science", icon: <Lightbulb className="w-4 h-4" /> },
  { name: "Chemistry", icon: <Sparkles className="w-4 h-4" /> },
  { name: "Biology", icon: <Info className="w-4 h-4" /> },
]

// Sample quick prompts
const quickPrompts = [
  "Explain the concept of derivatives in calculus",
  "Help me understand quantum mechanics",
  "What is object-oriented programming?",
  "How do I solve quadratic equations?",
  "Explain DNA replication",
]

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi there! I'm your AI tutor from Masterin. How can I help you with your learning today?",
      timestamp: new Date(),
      status: "sent",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
      status: "sending",
    }

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Simulate AI response delay
      setTimeout(() => {
        // Generate AI response based on user input
        const aiResponse = generateAIResponse(inputValue)

        // Create assistant message
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: aiResponse,
          timestamp: new Date(),
          status: "sent",
        }

        // Add assistant message to chat
        setMessages((prev) => [
          ...prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "sent" } : msg)),
          assistantMessage,
        ])
        setIsLoading(false)
      }, 1500)
    } catch (error) {
      // Handle error
      setMessages((prev) => prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "error" } : msg)))
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      // Check file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf", "text/plain"]
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Unsupported file type",
          description: "Please upload an image, PDF, or text file",
          variant: "destructive",
        })
        return
      }

      // In a real implementation, you would upload the file to a server
      // For now, we'll just add a message about the file
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: `I've uploaded a file: ${file.name}`,
        timestamp: new Date(),
        status: "sent",
      }
      setMessages((prev) => [...prev, userMessage])

      // Simulate AI response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I've received your file "${file.name}". What specific questions do you have about the content? I can help analyze the information, explain concepts, or provide additional context related to the material.`,
          timestamp: new Date(),
          status: "sent",
        }
        setMessages((prev) => [...prev, assistantMessage])
      }, 1000)
    }
  }

  // Function to generate AI responses based on user input
  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()

    // Default response if no specific topic is matched
    let response = "I'd be happy to help with that. Could you provide more details about what you'd like to learn?"

    // Biology - DNA
    if (lowerInput.includes("dna") && !lowerInput.includes("rna")) {
      response = `## DNA: The Blueprint of Life

**Definition**: DNA (Deoxyribonucleic Acid) is the genetic material that carries the instructions for the development, functioning, growth, and reproduction of all known organisms.

### Structure of DNA
DNA has a double-helix structure, resembling a twisted ladder:
- **Backbone**: Made of alternating sugar (deoxyribose) and phosphate groups
- **Rungs**: Formed by pairs of nitrogenous bases
- **Base pairs**: Adenine (A) always pairs with Thymine (T), and Guanine (G) always pairs with Cytosine (C)

### Key Functions
1. **Genetic Information Storage**: DNA stores genes, which contain instructions for building proteins
2. **Replication**: DNA can make exact copies of itself during cell division
3. **Transcription**: DNA serves as a template for RNA synthesis
4. **Mutation**: Changes in DNA can lead to genetic variation and evolution`
    }

    // DNA vs RNA comparison
    else if (
      lowerInput.includes("dna") &&
      lowerInput.includes("rna") &&
      (lowerInput.includes("compare") || lowerInput.includes("difference"))
    ) {
      response = `## DNA vs RNA: Key Differences and Similarities

DNA and RNA are nucleic acids that play crucial roles in genetic information and protein synthesis, but they differ in several important ways:

### Structural Differences

| Feature | DNA | RNA |
|---------|-----|-----|
| Full Name | Deoxyribonucleic Acid | Ribonucleic Acid |
| Structure | Double-stranded helix | Usually single-stranded |
| Sugar | Deoxyribose | Ribose (has OH group at 2' position) |
| Bases | A, G, C, T | A, G, C, U (Uracil instead of Thymine) |
| Stability | More stable | Less stable, more reactive |`
    }

    // RNA
    else if (lowerInput.includes("rna") && !lowerInput.includes("dna")) {
      response = `## RNA: The Versatile Nucleic Acid

**Definition**: RNA (Ribonucleic Acid) is a nucleic acid molecule essential for various biological roles including protein synthesis, catalyzing biological reactions, and controlling gene expression.

### Structure of RNA
- **Backbone**: Made of alternating ribose sugar and phosphate groups
- **Nitrogenous Bases**: Adenine (A), Uracil (U), Guanine (G), and Cytosine (C)
- **Usually single-stranded**, but can fold into complex 3D structures
- **More reactive** than DNA due to the hydroxyl group on the ribose sugar's 2' carbon`
    }

    // Calculus/Derivatives
    else if (lowerInput.includes("derivative") || lowerInput.includes("calculus")) {
      response = `## Derivatives in Calculus

A derivative measures the instantaneous rate of change of a function with respect to one of its variables. Geometrically, it represents the slope of the tangent line to the function's graph at a specific point.

### Fundamental Concept

The derivative of a function f(x) at a point x = a is defined as the limit:

f'(a) = lim_{h → 0} [f(a+h) - f(a)]/h

This limit, if it exists, gives us the instantaneous rate of change of f at point a.

### Key Derivative Rules

1. **Power Rule**: For f(x) = x^n, f'(x) = n·x^(n-1)
2. **Constant Rule**: For f(x) = c, f'(x) = 0
3. **Sum/Difference Rule**: [f(x) ± g(x)]' = f'(x) ± g'(x)
4. **Product Rule**: [f(x)·g(x)]' = f'(x)·g(x) + f(x)·g'(x)
5. **Chain Rule**: [f(g(x))]' = f'(g(x))·g'(x)`
    }

    return response
  }

  // Render the chat interface
  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <Card className="flex-1 flex flex-col overflow-hidden mb-4 shadow-lg">
        <div className="p-4 bg-purple-600 text-white">
          <h1 className="text-xl font-bold">Masterin AI Tutor</h1>
          <p className="text-sm opacity-90">Your personal AI learning assistant</p>
        </div>

        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user" ? "bg-purple-100 text-gray-800" : "bg-white border border-gray-200 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 bg-purple-600 text-white">
                      <span className="text-xs">AI</span>
                    </Avatar>
                  )}
                  <div>
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: message.content }} />
                    <div className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {message.status === "error" && <span className="text-red-500 ml-2">Error sending message</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts */}
        <div className="px-4 py-2 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Suggested topics:</p>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.slice(0, 3).map((prompt, index) => (
              <Button key={index} variant="outline" size="sm" className="text-xs" onClick={() => setInputValue(prompt)}>
                {prompt}
              </Button>
            ))}
          </div>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask anything about your studies..."
                className="min-h-[60px] resize-none pr-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <button
                type="button"
                onClick={handleFileUpload}
                className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600"
              >
                <PaperclipIcon className="h-5 w-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/jpeg,image/png,image/gif,application/pdf,text/plain"
              />
            </div>
            <Button type="submit" disabled={isLoading || !inputValue.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
