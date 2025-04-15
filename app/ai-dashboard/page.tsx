"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, FileText, PenTool, FlaskConical, MessageSquare } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function AIDashboardPage() {
  const router = useRouter()
  const { user, status } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth?redirect=/ai-dashboard")
    return null
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">AI Learning Tools</h1>
          <p className="text-muted-foreground">Personalized AI-powered tools to enhance your learning experience</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden md:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="tutor" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden md:inline">AI Tutor</span>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Assignments</span>
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            <span className="hidden md:inline">Quizzes</span>
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            <span className="hidden md:inline">Flashcards</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6 text-blue-600" />}
              title="AI Tutor"
              description="Get personalized explanations and answers to your questions"
              href="/ai-tutor"
              buttonText="Start Learning"
            />
            <FeatureCard
              icon={<FileText className="h-6 w-6 text-purple-600" />}
              title="Assignment Generator"
              description="Create custom assignments for any subject or topic"
              href="/ai-assignments"
              buttonText="Generate Assignments"
            />
            <FeatureCard
              icon={<PenTool className="h-6 w-6 text-green-600" />}
              title="Quiz Generator"
              description="Create quizzes to test your knowledge and track progress"
              href="/ai-quizzes"
              buttonText="Create Quizzes"
            />
            <FeatureCard
              icon={<FlaskConical className="h-6 w-6 text-orange-600" />}
              title="Flashcard Generator"
              description="Generate flashcards for effective memorization and review"
              href="/ai-flashcards"
              buttonText="Make Flashcards"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started with AI Learning Tools</CardTitle>
              <CardDescription>Enhance your learning experience with our AI-powered educational tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Ask the AI Tutor</h3>
                    <p className="text-sm text-muted-foreground">
                      Get instant answers to your questions across various subjects. The AI tutor provides personalized
                      explanations tailored to your learning level.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Generate Custom Assignments</h3>
                    <p className="text-sm text-muted-foreground">
                      Create assignments tailored to specific subjects, topics, and difficulty levels. Perfect for
                      self-study or teaching.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-full">
                    <PenTool className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Test Your Knowledge with Quizzes</h3>
                    <p className="text-sm text-muted-foreground">
                      Generate quizzes with various question types to test your understanding. Track your progress and
                      identify areas for improvement.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <FlaskConical className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Study with AI-Generated Flashcards</h3>
                    <p className="text-sm text-muted-foreground">
                      Create flashcard decks for effective memorization and spaced repetition learning. Perfect for
                      vocabulary, definitions, and key concepts.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutor">
          <Card>
            <CardHeader>
              <CardTitle>AI Tutor</CardTitle>
              <CardDescription>Get personalized explanations and answers to your questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our AI Tutor provides instant, personalized help across various subjects. Ask questions, get
                explanations, and deepen your understanding with interactive learning sessions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Personalized explanations tailored to your level</li>
                      <li>Support across multiple subjects</li>
                      <li>Related topics and resources for deeper learning</li>
                      <li>Save and review past conversations</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Popular Subjects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Mathematics</li>
                      <li>Science (Physics, Chemistry, Biology)</li>
                      <li>Computer Science</li>
                      <li>History and Social Studies</li>
                      <li>Language Arts and Literature</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/ai-tutor">Start Learning with AI Tutor</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Generator</CardTitle>
              <CardDescription>Create custom assignments for any subject or topic</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Generate high-quality educational assignments tailored to specific subjects, topics, and difficulty
                levels. Perfect for self-study, teaching, or creating practice materials.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Customizable difficulty levels</li>
                      <li>Learning objectives and grading criteria</li>
                      <li>Detailed instructions and resources</li>
                      <li>Save and share assignments</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Assignment Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Problem sets</li>
                      <li>Research projects</li>
                      <li>Case studies</li>
                      <li>Creative writing prompts</li>
                      <li>Lab experiments</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/ai-assignments">Create Assignments</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Generator</CardTitle>
              <CardDescription>Create quizzes to test your knowledge and track progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Generate customized quizzes with various question types to test understanding and knowledge retention.
                Track your progress and identify areas for improvement.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Multiple question types</li>
                      <li>Adjustable difficulty levels</li>
                      <li>Explanations for correct answers</li>
                      <li>Performance tracking and analytics</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Question Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Multiple choice</li>
                      <li>True/False</li>
                      <li>Short answer</li>
                      <li>Essay questions</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/ai-quizzes">Create Quizzes</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="flashcards">
          <Card>
            <CardHeader>
              <CardTitle>Flashcard Generator</CardTitle>
              <CardDescription>Generate flashcards for effective memorization and review</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Create flashcard decks for effective memorization and spaced repetition learning. Perfect for
                vocabulary, definitions, key concepts, and fact-based learning.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Generate from text or topics</li>
                      <li>Organize by categories</li>
                      <li>Spaced repetition learning</li>
                      <li>Progress tracking and statistics</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Best For</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Vocabulary and terminology</li>
                      <li>Definitions and concepts</li>
                      <li>Historical dates and events</li>
                      <li>Scientific formulas and equations</li>
                      <li>Language learning</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/ai-flashcards">Create Flashcards</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function FeatureCard({ icon, title, description, href, buttonText }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto pt-4">
        <Button asChild className="w-full">
          <Link href={href}>{buttonText}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
