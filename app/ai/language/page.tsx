"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MessageSquare, Globe, Volume2, BookOpen, Play } from "lucide-react"
import AIChatInterface from "@/components/ai-chat-interface"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/ai-service"

export default function LanguageTutorPage() {
  const [language, setLanguage] = useState("spanish")
  const [proficiency, setProficiency] = useState("beginner")
  const [learningGoal, setLearningGoal] = useState("conversation")
  const [practiceHistory, setPracticeHistory] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("practice")
  const { toast } = useToast()
  const { user } = useAuth()

  // System prompt for the language tutor
  const LANGUAGE_SYSTEM_PROMPT = `You are an expert language tutor specializing in teaching ${language.charAt(0).toUpperCase() + language.slice(1)}. Your goal is to help students learn and practice the language effectively.

  The student's proficiency level is: ${proficiency}
  Their learning goal is: ${learningGoal}

  When tutoring:
  1. Use appropriate language complexity for their proficiency level
  2. Provide clear explanations of grammar, vocabulary, and pronunciation
  3. Correct errors gently and explain the corrections
  4. Use the target language with translations when needed
  5. Engage in natural conversations about relevant topics
  6. Introduce new vocabulary and phrases gradually
  
  For different learning goals:
  - Conversation: Focus on practical dialogue and everyday expressions
  - Grammar: Emphasize rules, structure, and proper usage
  - Vocabulary: Introduce themed word sets and usage examples
  - Reading: Help with comprehension and cultural context
  - Travel: Teach practical phrases and cultural norms
  
  Always be encouraging and patient. Adapt your teaching style to the student's responses and progress.`

  // Load practice history when the component mounts
  useEffect(() => {
    if (user) {
      loadPracticeHistory()
    }
  }, [user])

  // Load practice history from Supabase
  const loadPracticeHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("user_id", user?.id)
        .eq("tool_type", "language-tutor")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error
      setPracticeHistory(data || [])
    } catch (error) {
      console.error("Error loading practice history:", error)
      toast({
        title: "Error",
        description: "Failed to load your practice history. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Language options with display names and levels
  const languageOptions = [
    { value: "spanish", label: "Spanish" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "italian", label: "Italian" },
    { value: "portuguese", label: "Portuguese" },
    { value: "japanese", label: "Japanese" },
    { value: "chinese", label: "Chinese (Mandarin)" },
    { value: "korean", label: "Korean" },
    { value: "russian", label: "Russian" },
    { value: "arabic", label: "Arabic" },
  ]

  // Proficiency levels
  const proficiencyLevels = [
    { value: "beginner", label: "Beginner (A1)" },
    { value: "elementary", label: "Elementary (A2)" },
    { value: "intermediate", label: "Intermediate (B1)" },
    { value: "upper_intermediate", label: "Upper Intermediate (B2)" },
    { value: "advanced", label: "Advanced (C1)" },
    { value: "proficient", label: "Proficient (C2)" },
  ]

  // Learning goals
  const learningGoals = [
    { value: "conversation", label: "Conversation" },
    { value: "grammar", label: "Grammar" },
    { value: "vocabulary", label: "Vocabulary" },
    { value: "reading", label: "Reading" },
    { value: "travel", label: "Travel" },
  ]

  // Example conversation starters based on proficiency and goal
  const getConversationStarters = () => {
    const starters = {
      beginner: {
        conversation: [
          "Hello! How are you today?",
          "Can you help me introduce myself?",
          "How do I order food at a restaurant?",
        ],
        grammar: [
          "Can you explain basic present tense verbs?",
          "How do I form simple questions?",
          "What are the basic pronouns?",
        ],
        vocabulary: [
          "Can you teach me colors and numbers?",
          "What are common greetings?",
          "How do I talk about my family?",
        ],
      },
      intermediate: {
        conversation: [
          "Let's discuss my hobbies and interests.",
          "Can we practice talking about my daily routine?",
          "I'd like to describe my last vacation.",
        ],
        grammar: [
          "Can you explain the past tense?",
          "How do I use conditional sentences?",
          "When should I use subjunctive mood?",
        ],
        vocabulary: [
          "I want to learn vocabulary for work and business.",
          "Can you teach me words related to technology?",
          "What are some idioms and expressions?",
        ],
      },
      advanced: {
        conversation: [
          "Let's discuss current events and politics.",
          "I'd like to debate environmental issues.",
          "Can we discuss cultural differences?",
        ],
        grammar: [
          "Can you explain complex sentence structures?",
          "How do I use advanced tenses correctly?",
          "What are common grammar mistakes to avoid?",
        ],
        vocabulary: [
          "I need specialized vocabulary for academic writing.",
          "Can you teach me literary terms and expressions?",
          "What are some regional dialects and variations?",
        ],
      },
    }

    // Determine which set of starters to use
    let level = proficiency
    if (["elementary", "beginner"].includes(proficiency)) {
      level = "beginner"
    } else if (["intermediate", "upper_intermediate"].includes(proficiency)) {
      level = "intermediate"
    } else {
      level = "advanced"
    }

    // Default to conversation if the goal isn't in our predefined list
    const goal = ["conversation", "grammar", "vocabulary"].includes(learningGoal) ? learningGoal : "conversation"

    return starters[level][goal]
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="md:w-1/3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5 text-purple-600" />
                Language Tutor
              </CardTitle>
              <CardDescription>
                Practice conversations, learn grammar, and expand your vocabulary with an AI language tutor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="practice">Practice</TabsTrigger>
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                </TabsList>
                <TabsContent value="practice" className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label htmlFor="language-select" className="text-sm font-medium">
                        Language:
                      </label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger id="language-select">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languageOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="proficiency-select" className="text-sm font-medium">
                        Proficiency Level:
                      </label>
                      <Select value={proficiency} onValueChange={setProficiency}>
                        <SelectTrigger id="proficiency-select">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {proficiencyLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="goal-select" className="text-sm font-medium">
                        Learning Goal:
                      </label>
                      <Select value={learningGoal} onValueChange={setLearningGoal}>
                        <SelectTrigger id="goal-select">
                          <SelectValue placeholder="Select goal" />
                        </SelectTrigger>
                        <SelectContent>
                          {learningGoals.map((goal) => (
                            <SelectItem key={goal.value} value={goal.value}>
                              {goal.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-2">
                      <h3 className="text-sm font-medium mb-2">Conversation Starters:</h3>
                      <div className="space-y-2">
                        {getConversationStarters().map((starter, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-left"
                            onClick={() => {
                              // This would typically set an initial message
                              toast({
                                title: "Conversation starter selected",
                                description: "Your tutor is ready to help with this topic.",
                              })
                            }}
                          >
                            {starter}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="progress">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Your Progress:</h3>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Vocabulary</span>
                            <span>65%</span>
                          </div>
                          <Progress value={65} className="h-2" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Grammar</span>
                            <span>48%</span>
                          </div>
                          <Progress value={48} className="h-2" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Conversation</span>
                            <span>72%</span>
                          </div>
                          <Progress value={72} className="h-2" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Pronunciation</span>
                            <span>53%</span>
                          </div>
                          <Progress value={53} className="h-2" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Recent Practice Sessions:</h3>
                      {practiceHistory.length > 0 ? (
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                          {practiceHistory.map((session) => (
                            <Card key={session.id} className="cursor-pointer hover:bg-gray-50">
                              <CardContent className="p-3">
                                <div className="text-sm font-medium">{session.title || "Practice Session"}</div>
                                <div className="flex justify-between items-center mt-1">
                                  <div className="text-xs text-gray-500">
                                    {new Date(session.created_at).toLocaleDateString()}
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {session.metadata?.duration || "15"} min
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">No recent practice sessions</div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Learning Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Vocabulary Lists", icon: <BookOpen className="h-4 w-4" /> },
                  { label: "Grammar Guide", icon: <BookOpen className="h-4 w-4" /> },
                  { label: "Pronunciation", icon: <Volume2 className="h-4 w-4" /> },
                  { label: "Listening Practice", icon: <Play className="h-4 w-4" /> },
                  { label: "Cultural Notes", icon: <Globe className="h-4 w-4" /> },
                  { label: "Phrase Book", icon: <MessageSquare className="h-4 w-4" /> },
                ].map((resource, index) => (
                  <Button key={index} variant="outline" size="sm" className="justify-start">
                    <span className="mr-2">{resource.icon}</span>
                    {resource.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="capitalize">{language}</span> Tutor
                <Badge className="ml-2 capitalize">{proficiency}</Badge>
              </CardTitle>
              <CardDescription>
                Practice {language} with your AI language tutor. Type in English or {language} to begin.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-[600px]">
              <AIChatInterface
                toolType="language-tutor"
                systemPrompt={LANGUAGE_SYSTEM_PROMPT}
                placeholder={`Type in English or ${language} to start practicing...`}
                initialMessages={[
                  {
                    role: "system",
                    content: LANGUAGE_SYSTEM_PROMPT,
                  },
                  {
                    role: "assistant",
                    content: `Hello! I'm your ${language} tutor. I'll help you practice based on your ${proficiency} level, focusing on ${learningGoal}. How would you like to start today?`,
                  },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
