"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Calculator, ChevronRight, History, Save, Upload } from "lucide-react"
import AIChatInterface from "@/components/ai-chat-interface"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/ai-service"
import { v4 as uuidv4 } from "uuid"

export default function MathSolverPage() {
  const [mathInput, setMathInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [savedProblems, setSavedProblems] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("solve")
  const { toast } = useToast()
  const { user } = useAuth()

  // System prompt for the math solver
  const MATH_SYSTEM_PROMPT = `You are an expert math tutor. Your goal is to help students understand mathematical concepts and solve problems.
  
  When solving problems:
  1. Break down the problem into clear steps
  2. Explain each step in detail
  3. Provide the final answer clearly marked
  4. Include alternative approaches when relevant
  5. Use LaTeX notation for mathematical expressions (e.g., $x^2 + 5x + 6$)
  
  For different types of math:
  - Algebra: Show step-by-step equation solving
  - Calculus: Explain derivatives, integrals, and limits clearly
  - Geometry: Include diagrams when possible (described in text) and explain theorems used
  - Statistics: Explain formulas and interpretations of results
  
  Always verify your answers and check for errors.`

  // Load saved problems when the component mounts
  useState(() => {
    if (user) {
      loadSavedProblems()
    }
  })

  // Load saved problems from Supabase
  const loadSavedProblems = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_saved_content")
        .select("*")
        .eq("user_id", user?.id)
        .eq("tool_type", "math-solver")
        .order("created_at", { ascending: false })

      if (error) throw error
      setSavedProblems(data || [])
    } catch (error) {
      console.error("Error loading saved problems:", error)
      toast({
        title: "Error",
        description: "Failed to load your saved problems. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Save a problem and its solution
  const saveProblem = async (problem: string, solution: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save problems.",
        variant: "default",
      })
      return
    }

    try {
      const { error } = await supabase.from("ai_saved_content").insert({
        id: uuidv4(),
        user_id: user.id,
        tool_type: "math-solver",
        title: problem.substring(0, 100),
        content: solution,
        metadata: { problem },
      })

      if (error) throw error

      toast({
        title: "Problem saved",
        description: "Your problem and solution have been saved successfully.",
      })

      // Reload saved problems
      loadSavedProblems()
    } catch (error) {
      console.error("Error saving problem:", error)
      toast({
        title: "Error",
        description: "Failed to save your problem. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle quick solve button click
  const handleQuickSolve = () => {
    if (!mathInput.trim()) {
      toast({
        title: "Empty input",
        description: "Please enter a math problem to solve.",
        variant: "destructive",
      })
      return
    }

    setActiveTab("chat")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="md:w-1/3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="mr-2 h-5 w-5 text-purple-600" />
                Math Problem Solver
              </CardTitle>
              <CardDescription>Get step-by-step solutions for algebra, calculus, statistics, and more</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="solve">Quick Solve</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="solve" className="space-y-4">
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Enter your math problem here... (e.g., Solve for x: 2x + 5 = 13)"
                      className="min-h-[150px]"
                      value={mathInput}
                      onChange={(e) => setMathInput(e.target.value)}
                    />
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Image
                      </Button>
                      <Button onClick={handleQuickSolve}>
                        Solve
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Example Problems:</h3>
                    <div className="space-y-1">
                      {[
                        "Solve for x: 3x² - 6x - 9 = 0",
                        "Find the derivative of f(x) = x³ - 4x² + 7x - 2",
                        "Calculate the area under the curve y = x² from x = 0 to x = 3",
                        "Find the probability of getting exactly 3 heads in 10 coin flips",
                      ].map((example, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-left"
                          onClick={() => setMathInput(example)}
                        >
                          {example}
                        </Button>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="history">
                  {savedProblems.length > 0 ? (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {savedProblems.map((problem) => (
                        <Card key={problem.id} className="cursor-pointer hover:bg-gray-50">
                          <CardContent className="p-3">
                            <div className="text-sm font-medium truncate">{problem.title}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(problem.created_at).toLocaleDateString()}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <History className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p>No saved problems yet</p>
                      <p className="text-sm">Solved problems will appear here</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Math Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Algebra",
                  "Calculus",
                  "Geometry",
                  "Statistics",
                  "Trigonometry",
                  "Linear Algebra",
                  "Probability",
                  "Number Theory",
                ].map((topic) => (
                  <Button key={topic} variant="outline" size="sm" className="justify-start">
                    {topic}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Math Assistant</CardTitle>
              <CardDescription>
                Ask questions, get step-by-step solutions, and deepen your understanding
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-[600px]">
              <AIChatInterface
                toolType="math-solver"
                systemPrompt={MATH_SYSTEM_PROMPT}
                placeholder="Ask any math question or enter a problem to solve..."
                initialMessages={
                  mathInput
                    ? [
                        {
                          role: "system",
                          content: MATH_SYSTEM_PROMPT,
                        },
                        {
                          role: "user",
                          content: mathInput,
                        },
                      ]
                    : []
                }
                onResponse={(response) => {
                  if (mathInput) {
                    // Offer to save the problem and solution
                    toast({
                      title: "Solution generated",
                      description: "Would you like to save this problem and solution?",
                      action: (
                        <Button size="sm" variant="outline" onClick={() => saveProblem(mathInput, response)}>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                      ),
                    })
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
