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
      content: "Hi there! I'm your AI tutor from Masterin. How can I help you with your learning today?",
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

  // Enhanced generateQuickResponse function with improved clarity and depth
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
      return "DNA and RNA differ in several key ways: DNA is double-stranded with deoxyribose sugar and uses thymine, while RNA is usually single-stranded with ribose sugar and uses uracil instead of thymine. DNA primarily stores genetic information, while RNA helps in protein synthesis and gene regulation. For a complete comparison with a detailed table, please click the 'Open Full Chat' button below."
    }

    if (lowerInput.includes("rna") && !lowerInput.includes("dna")) {
      return "RNA (Ribonucleic Acid) is a nucleic acid involved in protein synthesis and gene regulation. Unlike DNA, it's usually single-stranded and uses uracil instead of thymine. There are several types including mRNA (carries genetic information), tRNA (brings amino acids), and rRNA (forms ribosomes). For a comprehensive explanation of RNA structure and functions, please click the 'Open Full Chat' button below."
    }

    // Chemistry
    if (
      lowerInput.includes("periodic table") ||
      (lowerInput.includes("element") && lowerInput.includes("classification"))
    ) {
      return "The periodic table organizes chemical elements by atomic number and recurring properties. Elements are arranged in 7 periods (rows) and 18 groups (columns), with metals on the left, non-metals on the right, and metalloids in between. The table reveals important trends in properties like atomic radius and electronegativity. For a detailed explanation with visual aids, please click the 'Open Full Chat' button below."
    }

    // Mathematics
    if (lowerInput.includes("derivative") || lowerInput.includes("calculus")) {
      return "In calculus, a derivative measures how a function changes at a specific point, representing the slope of the tangent line at that point. Key rules include the power rule (d/dx[x^n] = nx^(n-1)), product rule, quotient rule, and chain rule. Derivatives have applications in physics, optimization, and curve analysis. For a comprehensive explanation with examples and formulas, please click the 'Open Full Chat' button below."
    }

    if (lowerInput.includes("quadratic") || (lowerInput.includes("equation") && lowerInput.includes("solve"))) {
      return "Quadratic equations (ax² + bx + c = 0) can be solved using three main methods: the quadratic formula x = (-b ± √(b² - 4ac))/2a, factoring when possible, or completing the square. The discriminant (b² - 4ac) tells us whether there are two real solutions, one repeated solution, or two complex solutions. For step-by-step examples and applications, please click the 'Open Full Chat' button below."
    }

    // Physics
    if (lowerInput.includes("quantum") || lowerInput.includes("mechanics")) {
      return "Quantum mechanics describes nature at the atomic and subatomic scales. Key principles include wave-particle duality (particles can behave as waves), Heisenberg's uncertainty principle (cannot precisely know both position and momentum), quantum superposition (particles exist in multiple states until measured), and quantum entanglement. For a detailed explanation of these concepts and their mathematical framework, please click the 'Open Full Chat' button below."
    }

    // Computer Science
    if (lowerInput.includes("object") && lowerInput.includes("programming")) {
      return "Object-Oriented Programming (OOP) is based on the concept of 'objects' containing data and code. The four main principles are: encapsulation (bundling data with methods), inheritance (creating new classes from existing ones), polymorphism (different implementations of the same interface), and abstraction (hiding complex implementation details). For code examples in multiple languages and detailed explanations, please click the 'Open Full Chat' button below."
    }

    // History
    if (
      (lowerInput.includes("world war") && lowerInput.includes("2")) ||
      lowerInput.includes("world war ii") ||
      lowerInput.includes("wwii")
    ) {
      return "World War II (1939-1945) was a global conflict between the Allies (US, UK, USSR, etc.) and Axis powers (Germany, Japan, Italy). Key events include Germany's invasion of Poland (1939), Pearl Harbor (1941), D-Day (1944), and the atomic bombings of Japan (1945). The war resulted in 70-85 million deaths and led to the formation of the UN, the Cold War, and significant geopolitical changes. For a detailed timeline and analysis, please click the 'Open Full Chat' button below."
    }

    // General greetings
    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return "Hello! I'm your AI tutor from Masterin. What would you like to learn about today? I can help with mathematics, science, computer programming, history, and many other subjects."
    }

    if (lowerInput.includes("help")) {
      return "I'd be happy to help you learn! I can explain concepts, solve problems, and answer questions on many academic subjects including mathematics, science, history, literature, and computer science. For a better experience with more detailed answers, please click the 'Open Full Chat' button below."
    }

    // Default response for other questions
    return "That's an interesting question! To provide a more detailed and helpful answer with proper formatting, examples, and visual aids, please click the 'Open Full Chat' button below where I can give you a comprehensive explanation."
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
