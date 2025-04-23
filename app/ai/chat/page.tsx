"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Paperclip, Bot, User, Loader2, ArrowLeft, Sparkles, BookOpen, Lightbulb } from "lucide-react"
import Link from "next/link"

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
]

// Sample quick prompts
const quickPrompts = [
  "Explain the concept of derivatives in calculus",
  "Help me understand quantum mechanics",
  "What is object-oriented programming?",
  "How do I solve quadratic equations?",
]

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi there! I'm your AI tutor. How can I help you with your learning today?",
      timestamp: new Date(),
      status: "sent",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
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
          content: `I've received your file "${file.name}". What would you like to know about it?`,
          timestamp: new Date(),
          status: "sent",
        }
        setMessages((prev) => [...prev, assistantMessage])
      }, 1000)
    }
  }

  // Let's enhance the generateAIResponse function to provide more detailed, educational responses

  // Replace the current generateAIResponse function with this improved version:

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()

    // DNA and RNA related questions
    if (lowerInput.includes("dna") && !lowerInput.includes("rna")) {
      return "DNA (Deoxyribonucleic Acid) is the genetic material that carries the instructions for the development, functioning, growth, and reproduction of all known organisms.\n\nKey facts about DNA:\n\n1. Structure: DNA is a double-helix structure made of two strands of nucleotides. Each nucleotide contains a sugar (deoxyribose), a phosphate group, and one of four nitrogen-containing bases: Adenine (A), Thymine (T), Guanine (G), or Cytosine (C).\n\n2. Base Pairing: In the double helix, A always pairs with T, and G always pairs with C through hydrogen bonds.\n\n3. Function: DNA stores genetic information in the form of genes, which are segments of DNA that code for specific proteins or RNA molecules.\n\n4. Replication: DNA can make copies of itself through a process called replication, which is essential for cell division.\n\nWould you like to learn more about DNA replication, transcription, or how DNA compares to RNA?"
    }

    if (
      lowerInput.includes("dna") &&
      lowerInput.includes("rna") &&
      (lowerInput.includes("compare") || lowerInput.includes("contrast") || lowerInput.includes("difference"))
    ) {
      return "Comparison between DNA and RNA:\n\n| Feature | DNA | RNA |\n|---------|-----|-----|\n| Full Name | Deoxyribonucleic Acid | Ribonucleic Acid |\n| Structure | Double-stranded helix | Usually single-stranded |\n| Sugar | Deoxyribose | Ribose |\n| Bases | Adenine (A), Guanine (G), Cytosine (C), Thymine (T) | Adenine (A), Guanine (G), Cytosine (C), Uracil (U) |\n| Base Pairing | A-T, G-C | A-U, G-C |\n| Location | Primarily in the nucleus | Nucleus and cytoplasm |\n| Stability | More stable | Less stable, degrades more easily |\n| Function | Long-term storage of genetic information | Protein synthesis, gene regulation |\n| Types | One main type | Multiple types (mRNA, tRNA, rRNA, etc.) |\n\nKey Differences:\n1. RNA uses ribose sugar instead of deoxyribose\n2. RNA uses uracil (U) instead of thymine (T)\n3. RNA is usually single-stranded while DNA is double-stranded\n4. RNA has more diverse functions in the cell\n\nWould you like me to elaborate on any specific aspect of this comparison?"
    }

    if (lowerInput.includes("rna") && !lowerInput.includes("dna")) {
      return "RNA (Ribonucleic Acid) is a nucleic acid that plays several important roles in biological processes, especially in protein synthesis.\n\nKey facts about RNA:\n\n1. Structure: RNA is typically single-stranded (unlike DNA's double-helix) and composed of nucleotides. Each nucleotide contains a ribose sugar, a phosphate group, and one of four nitrogen-containing bases: Adenine (A), Uracil (U), Guanine (G), or Cytosine (C).\n\n2. Types of RNA:\n   - Messenger RNA (mRNA): Carries genetic information from DNA to ribosomes for protein synthesis\n   - Transfer RNA (tRNA): Brings amino acids to ribosomes during protein synthesis\n   - Ribosomal RNA (rRNA): Forms part of ribosomes, the protein-making factories\n   - Non-coding RNAs: Involved in gene regulation and other cellular processes\n\n3. Function: RNA is primarily involved in protein synthesis, but also plays roles in gene regulation, catalyzing biological reactions, and more.\n\nWould you like to learn more about a specific type of RNA or its role in protein synthesis?"
    }

    // Mathematics related questions
    if (lowerInput.includes("derivative") || lowerInput.includes("calculus")) {
      return "In calculus, a derivative measures the sensitivity to change of a function's output with respect to its input. It's written as f'(x) or df/dx.\n\nThe derivative of a function at a chosen input value describes the rate of change of the function at that point. Geometrically, it represents the slope of the tangent line to the function's graph at that point.\n\nKey rules for derivatives:\n\n1. Power Rule: If f(x) = xⁿ, then f'(x) = n·xⁿ⁻¹\n2. Constant Rule: If f(x) = c (a constant), then f'(x) = 0\n3. Sum Rule: (f + g)' = f' + g'\n4. Product Rule: (f·g)' = f'·g + f·g'\n5. Quotient Rule: (f/g)' = (f'·g - f·g')/g²\n6. Chain Rule: (f(g(x)))' = f'(g(x))·g'(x)\n\nExample: The derivative of f(x) = x² is f'(x) = 2x\n\nWould you like me to explain any of these rules in more detail or work through a specific example?"
    }

    if (lowerInput.includes("quadratic") || (lowerInput.includes("equation") && lowerInput.includes("solve"))) {
      return "To solve a quadratic equation in the form ax² + bx + c = 0:\n\n1. Use the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a\n\n2. Calculate the discriminant (b² - 4ac):\n   - If discriminant > 0: Two distinct real solutions\n   - If discriminant = 0: One real solution (repeated root)\n   - If discriminant < 0: Two complex solutions\n\nExample: Solve x² - 5x + 6 = 0\n\nStep 1: Identify a = 1, b = -5, c = 6\n\nStep 2: Use the quadratic formula:\nx = (-(-5) ± √((-5)² - 4(1)(6))) / 2(1)\nx = (5 ± √(25 - 24)) / 2\nx = (5 ± √1) / 2\nx = (5 ± 1) / 2\n\nSo x = 3 or x = 2\n\nVerification: \nFor x = 3: 3² - 5(3) + 6 = 9 - 15 + 6 = 0 ✓\nFor x = 2: 2² - 5(2) + 6 = 4 - 10 + 6 = 0 ✓\n\nWould you like to try solving another quadratic equation?"
    }

    // Physics related questions
    if (lowerInput.includes("quantum") || lowerInput.includes("mechanics")) {
      return "Quantum mechanics is a fundamental theory in physics that describes nature at the smallest scales of energy levels of atoms and subatomic particles.\n\nKey concepts in quantum mechanics:\n\n1. Wave-Particle Duality: Particles like electrons can behave as both particles and waves, depending on how we observe them.\n\n2. Uncertainty Principle: Formulated by Heisenberg, it states that we cannot simultaneously know both the position and momentum of a particle with perfect precision. The more precisely we know one, the less precisely we can know the other.\n\n3. Superposition: Quantum systems can exist in multiple states simultaneously until measured or observed.\n\n4. Quantum Entanglement: When two particles become entangled, the quantum state of each particle cannot be described independently of the other, even when separated by large distances.\n\n5. Wave Function: Represented by the symbol ψ (psi), it contains all the information about a quantum system.\n\nThese principles lead to counterintuitive phenomena that challenge our classical understanding of physics, but have been consistently verified by experiments.\n\nWould you like me to elaborate on any of these concepts or discuss quantum applications like quantum computing?"
    }

    // Computer Science related questions
    if (lowerInput.includes("object") && lowerInput.includes("programming")) {
      return 'Object-oriented programming (OOP) is a programming paradigm based on the concept of \'objects\', which can contain data and code. The data is in the form of fields (attributes or properties), and the code is in the form of procedures (methods).\n\nKey concepts in OOP:\n\n1. Classes and Objects: A class is a blueprint for creating objects. An object is an instance of a class.\n\n2. Encapsulation: The bundling of data and methods that operate on that data within a single unit (class). It restricts direct access to some of an object\'s components, which is a means of preventing unintended interference and misuse.\n\n3. Inheritance: A mechanism where a new class (child/derived class) can inherit properties and methods from an existing class (parent/base class). This promotes code reusability.\n\n4. Polymorphism: The ability to present the same interface for different underlying forms (data types). It allows methods to do different things based on the object it is acting upon.\n\nExample in Python:\n```python\nclass Animal:\n    def __init__(self, name):\n        self.name = name\n    \n    def speak(self):\n        pass  # To be overridden by subclasses\n\nclass Dog(Animal):  # Inheritance\n    def speak(self):  # Polymorphism\n        return f"{self.name} says Woof!"\n\nclass Cat(Animal):  # Inheritance\n    def speak(self):  # Polymorphism\n        return f"{self.name} says Meow!"\n\n# Creating objects\ndog = Dog("Buddy")\ncat = Cat("Whiskers")\n\nprint(dog.speak())  # Output: Buddy says Woof!\nprint(cat.speak())  # Output: Whiskers says Meow!\n```\n\nWould you like me to explain any of these concepts in more detail or provide examples in another programming language?'
    }

    // General greetings
    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return "Hello! I'm your AI tutor. What subject would you like to learn about today? I can help with mathematics, physics, biology, chemistry, computer science, and many other subjects."
    }

    if (lowerInput.includes("thank")) {
      return "You're welcome! I'm glad I could help. Is there anything else you'd like to learn about?"
    }

    // Default response for other questions
    return "That's an interesting question! I'd be happy to help you learn about this topic. I can provide information on a wide range of subjects including mathematics, science, computer programming, history, and more. Could you provide a bit more detail about what specific aspects you'd like to understand better?"
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/ai" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">AI Tutor Chat</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Online</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto p-4 sm:p-6">
        <div className="container mx-auto max-w-4xl">
          {/* Welcome Card */}
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-4">
                  <Bot className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Welcome to your AI Tutor</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    I'm here to help you learn and understand any subject
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Ask me any question about your studies, and I'll provide personalized explanations, examples, and
                practice problems to help you master the concepts.
              </p>
              <div className="flex flex-wrap gap-2">
                {sampleSubjects.map((subject, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="bg-white dark:bg-gray-800"
                    onClick={() => setInputValue(`Help me learn about ${subject.name}`)}
                  >
                    {subject.icon}
                    <span className="ml-1">{subject.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <div className="space-y-4">
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
                    className={`rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div
                      className={`text-xs mt-1 ${
                        message.role === "user" ? "text-purple-200" : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {message.status === "sending" && (
                        <span className="ml-2">
                          <Loader2 className="w-3 h-3 inline animate-spin" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex flex-row">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 mr-2">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="rounded-lg p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-2 px-4">
        <div className="container mx-auto max-w-4xl overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {quickPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
                onClick={() => setInputValue(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <Button type="button" size="icon" variant="ghost" onClick={handleFileUpload} className="flex-shrink-0">
              <Paperclip className="w-5 h-5 text-gray-500" />
            </Button>
            <Input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <Input
              type="text"
              placeholder="Ask your question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" disabled={!inputValue.trim() || isLoading} className="flex-shrink-0">
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Your AI tutor is here to help you learn, not to do your homework for you.
          </p>
        </div>
      </div>
    </div>
  )
}
