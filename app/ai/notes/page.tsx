"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Save, Upload, ChevronRight, History } from "lucide-react"
import AIChatInterface from "@/components/ai-chat-interface"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/ai-service"
import { v4 as uuidv4 } from "uuid"

export default function StudyNotesGeneratorPage() {
  const [content, setContent] = useState("")
  const [noteTitle, setNoteTitle] = useState("")
  const [noteStyle, setNoteStyle] = useState("concise")
  const [savedNotes, setSavedNotes] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("create")
  const { toast } = useToast()
  const { user } = useAuth()

  // System prompt for the study notes generator
  const NOTES_SYSTEM_PROMPT = `You are an expert study notes generator. Your goal is to create clear, organized, and effective study notes from the content provided by students.

  When generating study notes:
  1. Identify and highlight key concepts, definitions, and important points
  2. Organize information in a logical structure with headings and subheadings
  3. Use bullet points and numbered lists for clarity
  4. Include mnemonics, diagrams (described in text), or other memory aids when helpful
  5. Summarize complex ideas in simpler terms
  6. Add examples to illustrate difficult concepts
  
  Adapt your style based on the student's preferences:
  - Concise: Focus on key points with minimal explanation
  - Detailed: Include comprehensive explanations and examples
  - Visual: Emphasize structure with bullet points, numbering, and clear organization
  - Q&A: Format notes as questions and answers for active recall
  
  Always maintain academic accuracy while making the content more accessible and easier to study.`

  // Load saved notes when the component mounts
  useEffect(() => {
    if (user) {
      loadSavedNotes()
    }
  }, [user])

  // Load saved notes from Supabase
  const loadSavedNotes = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_saved_content")
        .select("*")
        .eq("user_id", user?.id)
        .eq("tool_type", "study-notes")
        .order("created_at", { ascending: false })

      if (error) throw error
      setSavedNotes(data || [])
    } catch (error) {
      console.error("Error loading saved notes:", error)
      toast({
        title: "Error",
        description: "Failed to load your saved notes. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Save generated notes
  const saveNotes = async (title: string, notes: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save notes.",
        variant: "default",
      })
      return
    }

    try {
      const { error } = await supabase.from("ai_saved_content").insert({
        id: uuidv4(),
        user_id: user.id,
        tool_type: "study-notes",
        title: title || "Untitled Notes",
        content: notes,
        metadata: { style: noteStyle, originalContent: content.substring(0, 500) },
      })

      if (error) throw error

      toast({
        title: "Notes saved",
        description: "Your study notes have been saved successfully.",
      })

      // Reload saved notes
      loadSavedNotes()
    } catch (error) {
      console.error("Error saving notes:", error)
      toast({
        title: "Error",
        description: "Failed to save your notes. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle generate notes button click
  const handleGenerateNotes = () => {
    if (!content.trim()) {
      toast({
        title: "Empty input",
        description: "Please enter some content to generate notes from.",
        variant: "destructive",
      })
      return
    }

    if (!noteTitle.trim()) {
      setNoteTitle(`Study Notes - ${new Date().toLocaleDateString()}`)
    }

    setActiveTab("notes")
  }

  // Download notes as text file
  const downloadNotes = (notes: string, title: string) => {
    const element = document.createElement("a")
    const file = new Blob([notes], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${title || "study-notes"}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="md:w-1/3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-purple-600" />
                Study Notes Generator
              </CardTitle>
              <CardDescription>
                Transform your lecture notes, textbooks, and study materials into organized study notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="create">Create</TabsTrigger>
                  <TabsTrigger value="saved">Saved</TabsTrigger>
                </TabsList>
                <TabsContent value="create" className="space-y-4">
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="note-title">Title</Label>
                      <Input
                        id="note-title"
                        placeholder="Enter a title for your notes"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="note-style">Note Style</Label>
                      <Select value={noteStyle} onValueChange={setNoteStyle}>
                        <SelectTrigger id="note-style">
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="concise">Concise</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                          <SelectItem value="visual">Visual</SelectItem>
                          <SelectItem value="qa">Question & Answer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        placeholder="Paste your lecture notes, textbook content, or any study material here..."
                        className="min-h-[200px]"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload File
                      </Button>
                      <Button onClick={handleGenerateNotes}>
                        Generate Notes
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="saved">
                  {savedNotes.length > 0 ? (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {savedNotes.map((note) => (
                        <Card key={note.id} className="cursor-pointer hover:bg-gray-50">
                          <CardContent className="p-3">
                            <div className="text-sm font-medium truncate">{note.title}</div>
                            <div className="flex justify-between items-center mt-1">
                              <div className="text-xs text-gray-500">
                                {new Date(note.created_at).toLocaleDateString()}
                              </div>
                              <div className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                                {note.metadata?.style || "notes"}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <History className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p>No saved notes yet</p>
                      <p className="text-sm">Generated notes will appear here</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tips for Better Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 list-disc pl-5">
                <li>Include complete paragraphs for better context</li>
                <li>Specify the subject or topic for more relevant notes</li>
                <li>Choose the note style that fits your learning preferences</li>
                <li>Review and edit generated notes for accuracy</li>
                <li>Use the chat to ask for specific formatting or focus areas</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Notes Generator</CardTitle>
              <CardDescription>
                Your AI study assistant will transform your content into organized notes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-[600px]">
              <AIChatInterface
                toolType="study-notes"
                systemPrompt={NOTES_SYSTEM_PROMPT}
                placeholder="Ask questions about your notes or request specific formatting..."
                initialMessages={
                  content
                    ? [
                        {
                          role: "system",
                          content: NOTES_SYSTEM_PROMPT,
                        },
                        {
                          role: "user",
                          content: `Title: ${noteTitle || "Study Notes"}\nStyle: ${noteStyle}\n\nPlease generate ${noteStyle} study notes from the following content:\n\n${content}`,
                        },
                      ]
                    : []
                }
                onResponse={(response) => {
                  if (content) {
                    // Offer to save or download the notes
                    toast({
                      title: "Notes generated",
                      description: "Would you like to save or download these notes?",
                      action: (
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => saveNotes(noteTitle, response)}>
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => downloadNotes(response, noteTitle)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
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
