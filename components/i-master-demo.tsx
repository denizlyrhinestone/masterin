"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Sparkles, BookOpen, BarChart, Brain, ChevronRight } from "lucide-react"

export default function IMasterDemo() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "system",
      content: "Welcome to i-Master! I'm your AI learning assistant. How can I help you with your studies today?",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [currentSubject, setCurrentSubject] = useState("mathematics")

  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        role: "user",
        content: inputValue,
      },
    ])

    setInputValue("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      let response = ""

      if (inputValue.toLowerCase().includes("quadratic")) {
        response =
          "A quadratic equation is a second-degree polynomial equation of the form ax² + bx + c = 0, where a, b, and c are constants and a ≠ 0.\n\nTo solve a quadratic equation, you can use the quadratic formula:\n\nx = (-b ± √(b² - 4ac)) / 2a\n\nWould you like me to walk through an example problem?"
      } else if (inputValue.toLowerCase().includes("derivative")) {
        response =
          "The derivative measures the rate of change of a function with respect to a variable. It's a fundamental concept in calculus.\n\nFor a function f(x), the derivative is written as f'(x) or df/dx.\n\nFor example, if f(x) = x², then f'(x) = 2x.\n\nIs there a specific function you'd like to find the derivative of?"
      } else {
        response =
          "I'd be happy to help you with that. Could you provide more details about what you're studying or what specific concept you're trying to understand?"
      }

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: "assistant",
          content: response,
        },
      ])

      setIsTyping(false)
    }, 1500)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const subjectOptions = {
    mathematics: {
      title: "Mathematics",
      topics: ["Algebra", "Calculus", "Statistics", "Geometry", "Linear Algebra"],
      icon: <Brain className="h-5 w-5 text-blue-500" />,
    },
    computerScience: {
      title: "Computer Science",
      topics: ["Programming", "Data Structures", "Algorithms", "Databases", "Web Development"],
      icon: <BarChart className="h-5 w-5 text-purple-500" />,
    },
    physics: {
      title: "Physics",
      topics: ["Mechanics", "Electromagnetism", "Thermodynamics", "Quantum Physics", "Relativity"],
      icon: <BookOpen className="h-5 w-5 text-green-500" />,
    },
  }

  return (
    <div className="flex flex-col h-[600px] rounded-lg border shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src="/placeholder.svg?height=32&width=32&text=iM" />
            <AvatarFallback className="bg-blue-100 text-blue-600">iM</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-sm font-semibold">i-Master</h2>
            <div className="flex items-center">
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Tutor
              </Badge>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r bg-slate-50 hidden md:block">
          <div className="p-4">
            <h3 className="font-medium mb-2">Subject</h3>
            <div className="space-y-1 mb-6">
              {Object.keys(subjectOptions).map((subject) => (
                <button
                  key={subject}
                  className={`flex items-center w-full px-3 py-2 text-sm rounded-md ${
                    currentSubject === subject ? "bg-blue-100 text-blue-700" : "hover:bg-slate-200 text-slate-700"
                  }`}
                  onClick={() => setCurrentSubject(subject)}
                >
                  {subjectOptions[subject].icon}
                  <span className="ml-2">{subjectOptions[subject].title}</span>
                </button>
              ))}
            </div>

            <h3 className="font-medium mb-2">Topics</h3>
            <div className="space-y-1">
              {subjectOptions[currentSubject].topics.map((topic, index) => (
                <button
                  key={index}
                  className="flex items-center w-full px-3 py-1.5 text-sm rounded-md hover:bg-slate-200 text-slate-700"
                >
                  <span className="ml-2">{topic}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0 data-[state=inactive]:hidden">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className="flex-shrink-0 mt-1">
                      {message.role === "assistant" || message.role === "system" ? (
                        <Avatar className="h-8 w-8 border border-slate-200">
                          <AvatarImage src="/placeholder.svg?height=32&width=32&text=iM" />
                          <AvatarFallback className="bg-blue-100 text-blue-600">iM</AvatarFallback>
                        </Avatar>
                      ) : (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg?height=32&width=32" />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                    <div
                      className={`mx-2 rounded-lg px-4 py-2 shadow-sm ${
                        message.role === "user" ? "bg-blue-600 text-white" : "bg-white text-slate-800 border"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex max-w-[80%]">
                    <div className="flex-shrink-0 mt-1">
                      <Avatar className="h-8 w-8 border border-slate-200">
                        <AvatarImage src="/placeholder.svg?height=32&width=32&text=iM" />
                        <AvatarFallback className="bg-blue-100 text-blue-600">iM</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="mx-2 rounded-lg px-4 py-2 shadow-sm bg-white border text-slate-800">
                      <div className="flex items-center">
                        <span className="mr-2">Typing</span>
                        <span className="flex">
                          <span className="animate-bounce mx-0.5 h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                          <span className="animate-bounce animation-delay-200 mx-0.5 h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                          <span className="animate-bounce animation-delay-400 mx-0.5 h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Auto-scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t bg-white p-4">
              <div className="flex items-end gap-2">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask i-Master a question..."
                  className="min-h-[60px] flex-1 resize-none rounded-lg border-slate-200 focus-visible:ring-blue-500"
                  rows={2}
                />
                <Button
                  size="icon"
                  className="rounded-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue("How do I solve quadratic equations?")}
                >
                  Quadratic equations
                </Button>
                <Button variant="outline" size="sm" onClick={() => setInputValue("Explain derivatives in calculus")}>
                  Derivatives
                </Button>
                <Button variant="outline" size="sm" onClick={() => setInputValue("Help me understand linear algebra")}>
                  Linear algebra
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="flex-1 overflow-auto m-0 p-4 data-[state=inactive]:hidden">
            <h3 className="font-semibold text-lg mb-4">Learning Resources</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Quadratic Equations</CardTitle>
                  <CardDescription>Interactive tutorial</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm">
                    Master the quadratic formula with step-by-step examples and practice problems.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    Open Resource
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Calculus Fundamentals</CardTitle>
                  <CardDescription>Video series</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm">
                    Comprehensive video lessons covering derivatives, integrals, and applications.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    Open Resource
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Practice Problems</CardTitle>
                  <CardDescription>Interactive exercises</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm">
                    Test your knowledge with adaptive practice problems tailored to your skill level.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    Open Resource
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Study Guide</CardTitle>
                  <CardDescription>PDF document</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm">
                    Comprehensive study guide with key concepts, formulas, and example problems.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    Open Resource
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </div>
      </div>
    </div>
  )
}
