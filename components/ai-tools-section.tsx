"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Brain, FileText, Calculator, Code, BookOpen, Lock, Globe, Sparkles } from "lucide-react"

// Define the AI tools data
const aiTools = [
  {
    id: "ai-tutor",
    title: "AI Tutor",
    description: "Get personalized explanations and answers to any academic question",
    icon: <Brain className="h-6 w-6" />,
    image: "/ai-tutor-interface.png",
    path: "/ai/chat",
    popular: true,
    color: "from-purple-500 to-indigo-600",
  },
  {
    id: "essay-assistant",
    title: "Essay Assistant",
    description: "Get help with writing, editing, and improving your essays",
    icon: <FileText className="h-6 w-6" />,
    image: "/digital-essay-workspace.png",
    path: "/ai/essay",
    new: true,
    color: "from-blue-500 to-cyan-600",
  },
  {
    id: "math-solver",
    title: "Math Problem Solver",
    description: "Step-by-step solutions for algebra, calculus, and more",
    icon: <Calculator className="h-6 w-6" />,
    image: "/digital-equation-solver.png",
    path: "/ai/math",
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "code-mentor",
    title: "Code Mentor",
    description: "Learn programming with AI-guided coding exercises and explanations",
    icon: <Code className="h-6 w-6" />,
    image: "/interactive-code-lesson.png",
    path: "/ai/code",
    color: "from-orange-500 to-amber-600",
  },
  {
    id: "study-notes",
    title: "Study Notes Generator",
    description: "Create concise study notes from textbooks or lecture materials",
    icon: <BookOpen className="h-6 w-6" />,
    image: "/study-notes-generator-interface.png",
    path: "/ai/notes",
    color: "from-pink-500 to-rose-600",
  },
  {
    id: "language-tutor",
    title: "Language Tutor",
    description: "Practice conversations and improve your language skills",
    icon: <Globe className="h-6 w-6" />,
    image: "/multilingual-chat.png",
    path: "/ai/language",
    color: "from-violet-500 to-purple-600",
  },
]

export default function AIToolsSection() {
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [usageCount, setUsageCount] = useState<Record<string, number>>({})
  const [hoveredTool, setHoveredTool] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Load usage counts from localStorage on component mount
  useEffect(() => {
    try {
      const storedUsage = localStorage.getItem("tool_usage")
      if (storedUsage) {
        setUsageCount(JSON.parse(storedUsage))
      }
    } catch (e) {
      console.error("Error loading usage data:", e)
    }
  }, [])

  // Function to handle tool access
  const handleToolAccess = (toolId: string, path: string) => {
    if (isAuthenticated) {
      // Logged in users have full access
      router.push(path)
    } else {
      // For non-logged in users, track usage and limit
      const currentUsage = usageCount[toolId] || 0

      if (currentUsage >= 3) {
        // Limit reached, show login prompt
        toast({
          title: "Free trial limit reached",
          description: "Sign up or log in to continue using this tool",
          variant: "default",
          action: (
            <Button size="sm" variant="default" onClick={() => router.push("/auth/sign-up")}>
              Sign Up
            </Button>
          ),
        })
      } else {
        // Increment usage and allow access
        const newUsageCount = {
          ...usageCount,
          [toolId]: currentUsage + 1,
        }

        setUsageCount(newUsageCount)

        // Store in localStorage to persist between page refreshes
        try {
          localStorage.setItem("tool_usage", JSON.stringify(newUsageCount))
        } catch (e) {
          console.error("Error storing usage data:", e)
        }

        router.push(path)
      }
    }
  }

  // Filter tools based on search query - fixed to avoid undefined.includes error
  const filteredTools = searchQuery
    ? aiTools.filter(
        (tool) =>
          tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : aiTools

  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30">
            AI-Powered Learning
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Explore Our AI Learning Tools</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Powerful AI tools designed to enhance your learning experience and help you master any subject
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTools.map((tool) => (
            <Card
              key={tool.id}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              onMouseEnter={() => setHoveredTool(tool.id)}
              onMouseLeave={() => setHoveredTool(null)}
            >
              <div className="relative h-48">
                <Image
                  src={tool.image || "/placeholder.svg"}
                  alt={tool.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${tool.color} opacity-60 group-hover:opacity-70 transition-opacity`}
                ></div>
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-6">
                  <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm mb-4">{tool.icon}</div>
                  <h3 className="text-xl font-bold text-center mb-2">{tool.title}</h3>
                  <p className="text-sm text-center text-white/90">{tool.description}</p>
                </div>
                {tool.popular && (
                  <Badge className="absolute top-2 right-2 bg-purple-600 text-white">
                    <Sparkles className="w-3 h-3 mr-1" /> Popular
                  </Badge>
                )}
                {tool.new && <Badge className="absolute top-2 right-2 bg-green-600 text-white">New</Badge>}
              </div>
              <CardFooter className="flex justify-between items-center p-4 bg-white dark:bg-gray-800">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {!isAuthenticated && (
                    <div className="flex items-center">
                      <span>{3 - (usageCount[tool.id] || 0)} free tries left</span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => handleToolAccess(tool.id, tool.path)}
                  variant="default"
                  className={`${hoveredTool === tool.id ? "scale-105" : ""} transition-transform`}
                >
                  {isAuthenticated ? (
                    "Try Now"
                  ) : (
                    <>
                      Try Free
                      {(usageCount[tool.id] || 0) >= 3 && <Lock className="ml-2 h-3 w-3" />}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {!isAuthenticated && (
          <div className="mt-12 text-center">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Want unlimited access to all AI tools?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Sign up for a free account to get unlimited access to all our AI learning tools and personalized
                learning features.
              </p>
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  className="px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Sign Up for Free
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
