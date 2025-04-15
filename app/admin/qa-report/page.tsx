"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Server, Users, Code, CheckCircle, Brain } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function QAReportPage() {
  const router = useRouter()
  const { user, status } = useAuth()
  const [activeTab, setActiveTab] = useState("aiTutor")

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?redirect=/admin/qa-report")
    }
  }, [status, router])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Final Pre-Deployment QA Assessment</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
          <TabsTrigger value="aiTutor" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Tutor
          </TabsTrigger>
          <TabsTrigger value="navigation" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Navigation
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Content Display
          </TabsTrigger>
          <TabsTrigger value="ux" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Experience
          </TabsTrigger>
          <TabsTrigger value="lms" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            LMS Integration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="aiTutor">
          <QACard
            title="AI Tutor Functionality"
            description="Thoroughly test all AI tutor features"
            items={[
              "Verify accuracy, relevance, and helpfulness of AI responses.",
              "Ensure seamless integration with course content.",
              "Test question answering, content generation, and feedback mechanisms.",
            ]}
          />
        </TabsContent>

        <TabsContent value="navigation">
          <QACard
            title="Category and Course Navigation"
            description="Verify the accuracy and functionality of all navigation elements"
            items={[
              "Ensure users can easily browse, search, and access courses.",
              "Confirm all links and pathways function correctly.",
            ]}
          />
        </TabsContent>

        <TabsContent value="content">
          <QACard
            title="Content Display and Presentation"
            description="Meticulously review the display and presentation of all content"
            items={[
              "Ensure all content is displayed correctly, with no formatting issues or display errors.",
              "Verify that images are well-placed, appropriately sized, and visually appealing.",
              "Confirm that videos and interactive elements function as expected.",
            ]}
          />
        </TabsContent>

        <TabsContent value="ux">
          <Card>
            <CardHeader>
              <CardTitle>User Experience Evaluation</CardTitle>
              <CardDescription>Evaluate the overall user interface and user experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                This section evaluates the overall user experience, ensuring the website is intuitive, easy to navigate,
                and provides a positive learning environment.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Evaluate the website for intuitiveness and ease of navigation.</li>
                <li>Ensure a positive learning environment.</li>
                <li>Test responsiveness across different devices and screen sizes.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lms">
          <Card>
            <CardHeader>
              <CardTitle>LMS Integration Review</CardTitle>
              <CardDescription>Re-test the integration with the Learning Management System (LMS)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                This section provides a detailed review of the LMS integration, including seamless content sharing, data
                synchronization, and user authentication.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Verify seamless content sharing and data synchronization.</li>
                <li>Ensure all data transfers correctly between the platform and the LMS.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface QACardProps {
  title: string
  description: string
  items: string[]
}

function QACard({ title, description, items }: QACardProps) {
  const [completed, setCompleted] = useState(Array(items.length).fill(false))

  const toggleItem = (index: number) => {
    const newCompleted = [...completed]
    newCompleted[index] = !newCompleted[index]
    setCompleted(newCompleted)
  }

  const allCompleted = completed.every((item) => item)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {allCompleted && <CheckCircle className="h-6 w-6 text-green-500" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="list-none pl-0 space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={completed[index]}
                  onChange={() => toggleItem(index)}
                  className="mr-2 h-4 w-4"
                />
                {item}
              </label>
              {completed[index] && <CheckCircle className="h-4 w-4 text-green-500" />}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
