"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Copy, Save, Upload, ChevronRight, History, Check } from "lucide-react"
import AIChatInterface from "@/components/ai-chat-interface"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/ai-service"
import { v4 as uuidv4 } from "uuid"

export default function EssayAssistantPage() {
  const [essayTopic, setEssayTopic] = useState("")
  const [essayType, setEssayType] = useState("academic")
  const [essayContent, setEssayContent] = useState("")
  const [essayAction, setEssayAction] = useState("outline")
  const [savedEssays, setSavedEssays] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("write")
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  // System prompt for the essay assistant
  const ESSAY_SYSTEM_PROMPT = `You are an expert essay writing assistant. Your goal is to help students plan, write, edit, and improve their essays.

  When helping with essays:
  1. Provide clear, well-structured content
  2. Follow academic writing standards appropriate for the essay type
  3. Use evidence and examples to support arguments
  4. Ensure logical flow and coherence between paragraphs
  5. Maintain appropriate tone and style for the essay type
  
  For different essay types:
  - Academic: Formal tone, clear thesis, evidence-based arguments
  - Persuasive: Compelling arguments, emotional appeals, call to action
  - Narrative: Engaging storytelling, descriptive language, personal voice
  - Expository: Clear explanations, factual information, objective tone
  - Analytical: Critical analysis, detailed examination, logical evaluation
  
  For different assistance types:
  - Outline: Provide a structured outline with main points and supporting details
  - Draft: Generate a complete essay draft based on the topic
  - Edit: Improve the existing content for clarity, coherence, and style
  - Feedback: Provide constructive criticism and suggestions for improvement
  
  Always maintain academic integrity by helping students improve their writing skills rather than doing the work for them.`

  // Load saved essays when the component mounts
  useEffect(() => {
    if (user) {
      loadSavedEssays()
    }
  }, [user])

  // Load saved essays from Supabase
  const loadSavedEssays = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_saved_content")
        .select("*")
        .eq("user_id", user?.id)
        .eq("tool_type", "essay-assistant")
        .order("created_at", { ascending: false })

      if (error) throw error
      setSavedEssays(data || [])
    } catch (error) {
      console.error("Error loading saved essays:", error)
      toast({
        title: "Error",
        description: "Failed to load your saved essays. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Save an essay
  const saveEssay = async (topic: string, content: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save essays.",
        variant: "default",
      })
      return
    }

    try {
      const { error } = await supabase.from("ai_saved_content").insert({
        id: uuidv4(),
        user_id: user.id,
        tool_type: "essay-assistant",
        title: topic || "Untitled Essay",
        content: content,
        metadata: { type: essayType, action: essayAction },
      })

      if (error) throw error

      toast({
        title: "Essay saved",
        description: "Your essay has been saved successfully.",
      })

      // Reload saved essays
      loadSavedEssays()
    } catch (error) {
      console.error("Error saving essay:", error)
      toast({
        title: "Error",
        description: "Failed to save your essay. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Copy content to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard.",
    })
  }

  // Download essay as text file
  const downloadEssay = (content: string, title: string) => {
    const element = document.createElement("a")
    const file = new Blob([content], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${title || "essay"}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // Handle essay action button click
  const handleEssayAction = () => {
    if (essayAction === "edit" || essayAction === "feedback") {
      if (!essayContent.trim()) {
        toast({
          title: "Empty content",
          description: `Please enter essay content for ${essayAction}.`,
          variant: "destructive",
        })
        return
      }
    } else if (!essayTopic.trim()) {
      toast({
        title: "Empty topic",
        description: "Please enter an essay topic.",
        variant: "destructive",
      })
      return
    }

    setActiveTab("assistant")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="md:w-1/3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-purple-600" />
                Essay Assistant
              </CardTitle>
              <CardDescription>Get help with planning, writing, editing, and improving your essays</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="saved">Saved</TabsTrigger>
                </TabsList>
                <TabsContent value="write" className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="essay-action">I need help with:</Label>
                      <Select value={essayAction} onValueChange={setEssayAction}>
                        <SelectTrigger id="essay-action">
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="outline">Creating an outline</SelectItem>
                          <SelectItem value="draft">Writing a draft</SelectItem>
                          <SelectItem value="edit">Editing my essay</SelectItem>
                          <SelectItem value="feedback">Getting feedback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="essay-type">Essay type:</Label>
                      <Select value={essayType} onValueChange={setEssayType}>
                        <SelectTrigger id="essay-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="academic">Academic</SelectItem>
                          <SelectItem value="persuasive">Persuasive</SelectItem>
                          <SelectItem value="narrative">Narrative</SelectItem>
                          <SelectItem value="expository">Expository</SelectItem>
                          <SelectItem value="analytical">Analytical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="essay-topic">Essay topic:</Label>
                      <Input
                        id="essay-topic"
                        placeholder="Enter your essay topic or title"
                        value={essayTopic}
                        onChange={(e) => setEssayTopic(e.target.value)}
                      />
                    </div>

                    {(essayAction === "edit" || essayAction === "feedback") && (
                      <div className="space-y-1">
                        <Label htmlFor="essay-content">Your essay content:</Label>
                        <div className="relative">
                          <Textarea
                            id="essay-content"
                            placeholder="Paste your essay content here for editing or feedback..."
                            className="min-h-[200px]"
                            value={essayContent}
                            onChange={(e) => setEssayContent(e.target.value)}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(essayContent)}
                          >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload File
                      </Button>
                      <Button onClick={handleEssayAction}>
                        Get Help
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="saved">
                  {savedEssays.length > 0 ? (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {savedEssays.map((essay) => (
                        <Card key={essay.id} className="cursor-pointer hover:bg-gray-50">
                          <CardContent className="p-3">
                            <div className="text-sm font-medium truncate">{essay.title}</div>
                            <div className="flex justify-between items-center mt-1">
                              <div className="text-xs text-gray-500">
                                {new Date(essay.created_at).toLocaleDateString()}
                              </div>
                              <div className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                                {essay.metadata?.type || "essay"}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <History className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p>No saved essays yet</p>
                      <p className="text-sm">Your saved essays will appear here</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Writing Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>Start with a clear thesis statement</li>
                <li>Use topic sentences to begin each paragraph</li>
                <li>Support claims with evidence and examples</li>
                <li>Ensure logical flow between paragraphs</li>
                <li>Revise for clarity, coherence, and conciseness</li>
                <li>Proofread for grammar and spelling errors</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Essay Assistant</CardTitle>
              <CardDescription>
                Your AI writing assistant will help you create, improve, and refine your essays
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-[600px]">
              <AIChatInterface
                toolType="essay-assistant"
                systemPrompt={ESSAY_SYSTEM_PROMPT}
                placeholder="Ask questions about your essay or request specific help..."
                initialMessages={
                  activeTab === "assistant"
                    ? [
                        {
                          role: "system",
                          content: ESSAY_SYSTEM_PROMPT,
                        },
                        {
                          role: "user",
                          content:
                            essayAction === "edit" || essayAction === "feedback"
                              ? `I need help with ${essayAction} for my ${essayType} essay on "${essayTopic}". Here's my current content:\n\n${essayContent}`
                              : `I need help with creating an ${essayAction} for a ${essayType} essay on the topic: "${essayTopic}"`,
                        },
                      ]
                    : []
                }
                onResponse={(response) => {
                  // Offer to save or download the essay
                  toast({
                    title: "Essay assistance provided",
                    description: "Would you like to save or download this content?",
                    action: (
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => saveEssay(essayTopic, response)}>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => downloadEssay(response, essayTopic)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    ),
                  })
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
