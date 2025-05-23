import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Code, FileText, Languages } from "lucide-react"
import Link from "next/link"

export function AiToolsSection() {
  const tools = [
    {
      id: "chat",
      title: "AI Chat",
      description: "Chat with our AI assistant to get answers to your questions",
      icon: MessageSquare,
      href: "/ai/chat",
      color: "bg-blue-500",
    },
    {
      id: "code",
      title: "Code Assistant",
      description: "Get help with coding problems and learn programming concepts",
      icon: Code,
      href: "/ai",
      color: "bg-green-500",
    },
    {
      id: "essay",
      title: "Essay Helper",
      description: "Get assistance with writing and structuring essays",
      icon: FileText,
      href: "/ai",
      color: "bg-purple-500",
    },
    {
      id: "language",
      title: "Language Tutor",
      description: "Practice and learn new languages with AI assistance",
      icon: Languages,
      href: "/ai",
      color: "bg-yellow-500",
    },
  ]

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">AI Learning Tools</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Enhance your learning experience with our suite of AI-powered tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <Card key={tool.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${tool.color} flex items-center justify-center mb-4`}>
                  <tool.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle>{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={tool.href}>
                  <Button className="w-full">Try Now</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/ai">
            <Button variant="outline">View All AI Tools</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
