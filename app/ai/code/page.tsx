"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Code, Copy, Save, Check, BookOpen, History, ChevronRight } from "lucide-react"
import AIChatInterface from "@/components/ai-chat-interface"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/ai-service"
import { v4 as uuidv4 } from "uuid"

export default function CodeMentorPage() {
  const [language, setLanguage] = useState("javascript")
  const [codeSnippet, setCodeSnippet] = useState("")
  const [savedSnippets, setSavedSnippets] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("code")
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  // System prompt for the code mentor
  const CODE_SYSTEM_PROMPT = `You are an expert programming mentor specializing in helping students learn to code. Your expertise covers multiple programming languages and concepts.

  When helping with code:
  1. Provide clear, concise explanations of concepts
  2. Give working code examples with comments explaining each part
  3. Suggest best practices and point out potential issues
  4. If debugging, identify the problem and explain the solution
  5. Always use proper code formatting with syntax highlighting
  
  For different programming tasks:
  - Explain concepts thoroughly but accessibly
  - Provide complete, working solutions that follow best practices
  - Include test cases or examples of how to use the code
  - Suggest improvements or optimizations when appropriate
  
  Adapt your explanations based on the apparent skill level of the student. Use simple language for beginners and more technical terms for advanced questions.`

  // Load saved snippets when the component mounts
  useEffect(() => {
    if (user) {
      loadSavedSnippets()
    }
  }, [user])

  // Load saved snippets from Supabase
  const loadSavedSnippets = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_saved_content")
        .select("*")
        .eq("user_id", user?.id)
        .eq("tool_type", "code-mentor")
        .order("created_at", { ascending: false })

      if (error) throw error
      setSavedSnippets(data || [])
    } catch (error) {
      console.error("Error loading saved snippets:", error)
      toast({
        title: "Error",
        description: "Failed to load your saved code snippets. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Save a code snippet and its explanation
  const saveSnippet = async (code: string, explanation: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save code snippets.",
        variant: "default",
      })
      return
    }

    try {
      const { error } = await supabase.from("ai_saved_content").insert({
        id: uuidv4(),
        user_id: user.id,
        tool_type: "code-mentor",
        title: code.substring(0, 100).replace(/\n/g, " "),
        content: explanation,
        metadata: { code, language },
      })

      if (error) throw error

      toast({
        title: "Code snippet saved",
        description: "Your code snippet and explanation have been saved successfully.",
      })

      // Reload saved snippets
      loadSavedSnippets()
    } catch (error) {
      console.error("Error saving snippet:", error)
      toast({
        title: "Error",
        description: "Failed to save your code snippet. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Copy code to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied to clipboard",
      description: "Code has been copied to your clipboard.",
    })
  }

  // Handle analyze code button click
  const handleAnalyzeCode = () => {
    if (!codeSnippet.trim()) {
      toast({
        title: "Empty input",
        description: "Please enter some code to analyze.",
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
                <Code className="mr-2 h-5 w-5 text-purple-600" />
                Code Mentor
              </CardTitle>
              <CardDescription>Get help with coding, debugging, and understanding programming concepts</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="code">Code</TabsTrigger>
                  <TabsTrigger value="saved">Saved</TabsTrigger>
                </TabsList>
                <TabsContent value="code" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="language-select" className="text-sm font-medium">
                        Language:
                      </label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger id="language-select" className="w-[180px]">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="csharp">C#</SelectItem>
                          <SelectItem value="cpp">C++</SelectItem>
                          <SelectItem value="go">Go</SelectItem>
                          <SelectItem value="ruby">Ruby</SelectItem>
                          <SelectItem value="php">PHP</SelectItem>
                          <SelectItem value="swift">Swift</SelectItem>
                          <SelectItem value="typescript">TypeScript</SelectItem>
                          <SelectItem value="rust">Rust</SelectItem>
                          <SelectItem value="kotlin">Kotlin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="relative">
                      <textarea
                        className="w-full h-[200px] p-3 font-mono text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder={`Paste your ${language} code here or type a coding question...`}
                        value={codeSnippet}
                        onChange={(e) => setCodeSnippet(e.target.value)}
                      ></textarea>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(codeSnippet)}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" size="sm">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Examples
                      </Button>
                      <Button onClick={handleAnalyzeCode}>
                        Analyze Code
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">What can Code Mentor help with?</h3>
                    <ul className="text-sm space-y-1 list-disc pl-5">
                      <li>Explain code and programming concepts</li>
                      <li>Debug and fix errors in your code</li>
                      <li>Optimize and improve your code</li>
                      <li>Suggest best practices and patterns</li>
                      <li>Help with algorithm design and implementation</li>
                      <li>Convert code between programming languages</li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="saved">
                  {savedSnippets.length > 0 ? (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {savedSnippets.map((snippet) => (
                        <Card key={snippet.id} className="cursor-pointer hover:bg-gray-50">
                          <CardContent className="p-3">
                            <div className="text-sm font-medium truncate">{snippet.title}</div>
                            <div className="flex justify-between items-center mt-1">
                              <div className="text-xs text-gray-500">
                                {new Date(snippet.created_at).toLocaleDateString()}
                              </div>
                              <div className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                                {snippet.metadata?.language || "code"}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <History className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p>No saved code snippets yet</p>
                      <p className="text-sm">Your saved code will appear here</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Popular Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Data Structures",
                  "Algorithms",
                  "Web Development",
                  "APIs",
                  "Databases",
                  "Testing",
                  "Debugging",
                  "Performance",
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
              <CardTitle>Code Assistant</CardTitle>
              <CardDescription>
                Ask questions, get code explanations, and improve your programming skills
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-[600px]">
              <AIChatInterface
                toolType="code-mentor"
                systemPrompt={CODE_SYSTEM_PROMPT}
                placeholder="Ask a coding question or paste code for analysis..."
                initialMessages={
                  codeSnippet
                    ? [
                        {
                          role: "system",
                          content: CODE_SYSTEM_PROMPT,
                        },
                        {
                          role: "user",
                          content: `Language: ${language}\n\nPlease analyze this code and explain what it does, any issues it might have, and how it could be improved:\n\n\`\`\`${language}\n${codeSnippet}\n\`\`\``,
                        },
                      ]
                    : []
                }
                onResponse={(response) => {
                  if (codeSnippet) {
                    // Offer to save the code and explanation
                    toast({
                      title: "Analysis complete",
                      description: "Would you like to save this code and explanation?",
                      action: (
                        <Button size="sm" variant="outline" onClick={() => saveSnippet(codeSnippet, response)}>
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
