"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, FlaskConical, ArrowLeft, ChevronLeft, ChevronRight, RotateCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import type { Flashcard } from "@/lib/ai-service"

export default function AIFlashcardsPage() {
  const router = useRouter()
  const { user, status } = useAuth()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("create")
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [topic, setTopic] = useState("")
  const [numberOfCards, setNumberOfCards] = useState("10")
  const [content, setContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedFlashcards, setGeneratedFlashcards] = useState<Flashcard[]>([])
  const [savedDecks, setSavedDecks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [studyDeck, setStudyDeck] = useState<{
    deckId: string
    title: string
    cards: Flashcard[]
    currentCardIndex: number
    showingFront: boolean
  } | null>(null)

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth?redirect=/ai-flashcards")
    return null
  }

  // Fetch saved flashcard decks
  const fetchDecks = async () => {
    if (status !== "authenticated") return

    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/flashcards")
      if (!response.ok) throw new Error("Failed to fetch flashcard decks")

      const data = await response.json()
      setSavedDecks(data)
    } catch (error) {
      console.error("Error fetching flashcard decks:", error)
      toast({
        title: "Error",
        description: "Failed to load your saved flashcard decks",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Generate flashcards
  const generateFlashcards = async () => {
    if (!title || !subject || !topic || !numberOfCards) {
      toast({
        title: "Missing information",
        description: "Please provide title, subject, topic, and number of cards",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedFlashcards([])

    try {
      const response = await fetch("/api/ai/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          subject,
          topic,
          numberOfCards: Number.parseInt(numberOfCards),
          content: content || undefined,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate flashcards")

      const data = await response.json()
      setGeneratedFlashcards(data.flashcards)

      toast({
        title: "Success",
        description: "Flashcards generated successfully",
      })

      // Switch to the preview tab
      setActiveTab("preview")
    } catch (error) {
      console.error("Error generating flashcards:", error)
      toast({
        title: "Error",
        description: "Failed to generate flashcards. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Start studying a deck
  const startStudying = (deckId: string, deckTitle: string, cards: Flashcard[]) => {
    setStudyDeck({
      deckId,
      title: deckTitle,
      cards,
      currentCardIndex: 0,
      showingFront: true,
    })
    setActiveTab("study")
  }

  // Flip current flashcard
  const flipCard = () => {
    if (!studyDeck) return

    setStudyDeck({
      ...studyDeck,
      showingFront: !studyDeck.showingFront,
    })
  }

  // Navigate to next card
  const nextCard = () => {
    if (!studyDeck) return

    const nextIndex = (studyDeck.currentCardIndex + 1) % studyDeck.cards.length

    setStudyDeck({
      ...studyDeck,
      currentCardIndex: nextIndex,
      showingFront: true,
    })
  }

  // Navigate to previous card
  const prevCard = () => {
    if (!studyDeck) return

    const prevIndex = (studyDeck.currentCardIndex - 1 + studyDeck.cards.length) % studyDeck.cards.length

    setStudyDeck({
      ...studyDeck,
      currentCardIndex: prevIndex,
      showingFront: true,
    })
  }

  // Load decks when viewing saved tab
  if (activeTab === "saved" && savedDecks.length === 0 && !isLoading) {
    fetchDecks()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">AI Flashcard Generator</h1>
          <p className="text-muted-foreground">Create flashcards for effective memorization and review</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/ai-dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
          <TabsTrigger value="study">Study</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create Flashcard Deck</CardTitle>
              <CardDescription>
                Generate a custom flashcard deck by providing the subject, topic, and other parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Deck Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Biology Terms, Spanish Vocabulary"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Biology, Spanish, History"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Cell Biology, Verb Conjugation, World War II"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cards">Number of Cards</Label>
                    <Select value={numberOfCards} onValueChange={setNumberOfCards}>
                      <SelectTrigger id="cards">
                        <SelectValue placeholder="Select number" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Cards</SelectItem>
                        <SelectItem value="10">10 Cards</SelectItem>
                        <SelectItem value="15">15 Cards</SelectItem>
                        <SelectItem value="20">20 Cards</SelectItem>
                        <SelectItem value="30">30 Cards</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content to Base Flashcards On (Optional)</Label>
                  <Textarea
                    id="content"
                    placeholder="Paste text content to generate flashcards from..."
                    className="min-h-[220px]"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    You can paste text content to generate flashcards based on specific material. Leave blank for AI to
                    generate cards based on the topic.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={generateFlashcards} disabled={isGenerating} className="w-full md:w-auto">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>Generate Flashcards</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          {generatedFlashcards.length > 0 ? (
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>
                      {subject} • {topic} • {generatedFlashcards.length} cards
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setActiveTab("create")}>
                      Create Another
                    </Button>
                    <Button onClick={() => startStudying("preview", title, generatedFlashcards)}>Start Studying</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {generatedFlashcards.map((card, index) => (
                      <div key={index} className="border rounded-md p-4 hover:bg-slate-50 transition-colors">
                        <div className="font-medium mb-2">Card {index + 1}</div>
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm text-muted-foreground">Front:</div>
                            <div className="mt-1">{card.front}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Back:</div>
                            <div className="mt-1">{card.back}</div>
                          </div>
                          {card.category && (
                            <Badge variant="outline" className="mt-2">
                              {card.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-4">
                <Button className="w-full sm:w-auto">Save Deck</Button>
                <Button variant="outline" className="w-full sm:w-auto">
                  Print / Export PDF
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FlaskConical className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Flashcards Generated</h3>
                <p className="text-muted-foreground text-center mb-6">Generate flashcards first to preview them here</p>
                <Button onClick={() => setActiveTab("create")}>Create Flashcards</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Flashcard Decks</CardTitle>
              <CardDescription>View and manage your saved flashcard decks</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : savedDecks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FlaskConical className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Saved Flashcard Decks</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't saved any flashcard decks yet. Generate and save a deck to see it here.
                  </p>
                  <Button onClick={() => setActiveTab("create")}>Create Flashcards</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedDecks.map((deck) => (
                    <div key={deck.id} className="border rounded-md p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <h3 className="font-medium">{deck.title}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge variant="outline">{deck.subject}</Badge>
                            <Badge variant="outline">{deck.topic}</Badge>
                            <Badge variant="outline">{deck.cards?.length || 0} cards</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Created on {new Date(deck.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 mt-2 md:mt-0">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button size="sm" onClick={() => startStudying(deck.id, deck.title, deck.cards || [])}>
                            Study
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="study">
          {studyDeck ? (
            <Card className="relative overflow-hidden">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>{studyDeck.title}</CardTitle>
                    <CardDescription>
                      Card {studyDeck.currentCardIndex + 1} of {studyDeck.cards.length}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("saved")}>
                      Exit Study
                    </Button>
                    <Button variant="outline" size="icon" onClick={prevCard}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextCard}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="min-h-[300px] flex items-center justify-center p-8 border rounded-lg cursor-pointer select-none"
                  onClick={flipCard}
                >
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-2">
                      {studyDeck.showingFront ? "Front" : "Back"}
                    </div>
                    <div className="text-xl">
                      {studyDeck.showingFront
                        ? studyDeck.cards[studyDeck.currentCardIndex].front
                        : studyDeck.cards[studyDeck.currentCardIndex].back}
                    </div>
                    <div className="text-sm text-muted-foreground mt-4">Click to flip card</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={flipCard}>
                    <RotateCw className="h-4 w-4 mr-2" />
                    Flip
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={prevCard}>
                    Previous
                  </Button>
                  <Button size="sm" onClick={nextCard}>
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FlaskConical className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Study Session</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Select a flashcard deck to study from your saved decks or generate a new one
                </p>
                <div className="flex gap-4">
                  <Button onClick={() => setActiveTab("create")}>Create Flashcards</Button>
                  <Button variant="outline" onClick={() => setActiveTab("saved")}>
                    View Saved Decks
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
