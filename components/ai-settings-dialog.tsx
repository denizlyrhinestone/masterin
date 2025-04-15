"use client"

import type React from "react"

import { useState } from "react"
import { Settings, Save } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface AISettingsDialogProps {
  type: "tutor" | "assignment" | "quiz" | "flashcard"
  settings: AISettings
  onSave: (settings: AISettings) => void
  children?: React.ReactNode
}

export interface AISettings {
  // General settings
  model: string
  temperature: number
  maxTokens?: number

  // Tutor settings
  tutorPersonality?: "friendly" | "formal" | "socratic" | "concise"
  tutorExpertiseLevel?: "beginner" | "intermediate" | "advanced" | "expert"
  tutorResponseFormat?: "conversational" | "structured" | "detailed" | "simplified"

  // Assignment settings
  assignmentFormat?: "standard" | "rubric" | "project" | "essay"
  includeExamples?: boolean
  includeSolutions?: boolean

  // Quiz settings
  quizIncludeExplanations?: boolean
  quizIncludeHints?: boolean
  quizAdaptiveDifficulty?: boolean

  // Flashcard settings
  flashcardIncludeImages?: boolean
  flashcardIncludeExamples?: boolean
  flashcardSpacedRepetition?: boolean
}

export function AISettingsDialog({ type, settings, onSave, children }: AISettingsDialogProps) {
  const { toast } = useToast()
  const [localSettings, setLocalSettings] = useState<AISettings>(settings)
  const [open, setOpen] = useState(false)

  const handleSave = () => {
    onSave(localSettings)
    setOpen(false)
    toast({
      title: "Settings saved",
      description: `Your ${type} settings have been updated`,
    })
  }

  const updateSetting = (key: keyof AISettings, value: any) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" /> Settings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>AI {type.charAt(0).toUpperCase() + type.slice(1)} Settings</DialogTitle>
          <DialogDescription>
            Customize how the AI generates content for you. Changes will apply to future generations.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="model">AI Model</Label>
              <Select value={localSettings.model} onValueChange={(value) => updateSetting("model", value)}>
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o (Most Capable)</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select which AI model to use. More capable models may produce better results but could be slower.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="temperature">Creativity</Label>
                <span className="text-sm text-muted-foreground">{localSettings.temperature.toFixed(1)}</span>
              </div>
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.1}
                value={[localSettings.temperature]}
                onValueChange={(value) => updateSetting("temperature", value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Precise</span>
                <span>Creative</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Lower values produce more predictable outputs, higher values make output more creative and varied.
              </p>
            </div>

            {type === "tutor" && (
              <div className="space-y-2">
                <Label htmlFor="tutorPersonality">Tutor Personality</Label>
                <Select
                  value={localSettings.tutorPersonality}
                  onValueChange={(value: any) => updateSetting("tutorPersonality", value)}
                >
                  <SelectTrigger id="tutorPersonality">
                    <SelectValue placeholder="Select personality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly and Encouraging</SelectItem>
                    <SelectItem value="formal">Formal and Professional</SelectItem>
                    <SelectItem value="socratic">Socratic (Question-Based)</SelectItem>
                    <SelectItem value="concise">Concise and Direct</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {type === "assignment" && (
              <div className="space-y-2">
                <Label htmlFor="assignmentFormat">Assignment Format</Label>
                <Select
                  value={localSettings.assignmentFormat}
                  onValueChange={(value: any) => updateSetting("assignmentFormat", value)}
                >
                  <SelectTrigger id="assignmentFormat">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Assignment</SelectItem>
                    <SelectItem value="rubric">Rubric-Based</SelectItem>
                    <SelectItem value="project">Project-Based</SelectItem>
                    <SelectItem value="essay">Essay/Writing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {type === "quiz" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="quizIncludeExplanations">Include Explanations</Label>
                    <p className="text-xs text-muted-foreground">Provide explanations for correct answers</p>
                  </div>
                  <Switch
                    id="quizIncludeExplanations"
                    checked={localSettings.quizIncludeExplanations}
                    onCheckedChange={(value) => updateSetting("quizIncludeExplanations", value)}
                  />
                </div>
              </div>
            )}

            {type === "flashcard" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="flashcardIncludeExamples">Include Examples</Label>
                    <p className="text-xs text-muted-foreground">Add examples to flashcards when relevant</p>
                  </div>
                  <Switch
                    id="flashcardIncludeExamples"
                    checked={localSettings.flashcardIncludeExamples}
                    onCheckedChange={(value) => updateSetting("flashcardIncludeExamples", value)}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 py-4">
            {type === "tutor" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="tutorExpertiseLevel">Expertise Level</Label>
                  <Select
                    value={localSettings.tutorExpertiseLevel}
                    onValueChange={(value: any) => updateSetting("tutorExpertiseLevel", value)}
                  >
                    <SelectTrigger id="tutorExpertiseLevel">
                      <SelectValue placeholder="Select expertise level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (Simplified)</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert (Technical)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tutorResponseFormat">Response Format</Label>
                  <Select
                    value={localSettings.tutorResponseFormat}
                    onValueChange={(value: any) => updateSetting("tutorResponseFormat", value)}
                  >
                    <SelectTrigger id="tutorResponseFormat">
                      <SelectValue placeholder="Select response format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="structured">Structured (With Sections)</SelectItem>
                      <SelectItem value="detailed">Detailed (In-depth)</SelectItem>
                      <SelectItem value="simplified">Simplified (Concise)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {type === "assignment" && (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="includeExamples">Include Examples</Label>
                    <p className="text-xs text-muted-foreground">Add example solutions or approaches to assignments</p>
                  </div>
                  <Switch
                    id="includeExamples"
                    checked={localSettings.includeExamples}
                    onCheckedChange={(value) => updateSetting("includeExamples", value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="includeSolutions">Include Solutions</Label>
                    <p className="text-xs text-muted-foreground">Generate solution guides for assignments</p>
                  </div>
                  <Switch
                    id="includeSolutions"
                    checked={localSettings.includeSolutions}
                    onCheckedChange={(value) => updateSetting("includeSolutions", value)}
                  />
                </div>
              </>
            )}

            {type === "quiz" && (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="quizIncludeHints">Include Hints</Label>
                    <p className="text-xs text-muted-foreground">
                      Add hints that can be revealed for difficult questions
                    </p>
                  </div>
                  <Switch
                    id="quizIncludeHints"
                    checked={localSettings.quizIncludeHints}
                    onCheckedChange={(value) => updateSetting("quizIncludeHints", value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="quizAdaptiveDifficulty">Adaptive Difficulty</Label>
                    <p className="text-xs text-muted-foreground">Adjust question difficulty based on performance</p>
                  </div>
                  <Switch
                    id="quizAdaptiveDifficulty"
                    checked={localSettings.quizAdaptiveDifficulty}
                    onCheckedChange={(value) => updateSetting("quizAdaptiveDifficulty", value)}
                  />
                </div>
              </>
            )}

            {type === "flashcard" && (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="flashcardIncludeImages">Include Images</Label>
                    <p className="text-xs text-muted-foreground">Generate image suggestions for flashcards</p>
                  </div>
                  <Switch
                    id="flashcardIncludeImages"
                    checked={localSettings.flashcardIncludeImages}
                    onCheckedChange={(value) => updateSetting("flashcardIncludeImages", value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="flashcardSpacedRepetition">Spaced Repetition</Label>
                    <p className="text-xs text-muted-foreground">Optimize flashcards for spaced repetition learning</p>
                  </div>
                  <Switch
                    id="flashcardSpacedRepetition"
                    checked={localSettings.flashcardSpacedRepetition}
                    onCheckedChange={(value) => updateSetting("flashcardSpacedRepetition", value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="maxTokens">Maximum Length (Tokens)</Label>
              <Input
                id="maxTokens"
                type="number"
                value={localSettings.maxTokens || 2048}
                onChange={(e) => updateSetting("maxTokens", Number.parseInt(e.target.value))}
                min={256}
                max={8192}
              />
              <p className="text-xs text-muted-foreground">
                Maximum length of generated content. Higher values allow for more detailed responses but may take
                longer.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
