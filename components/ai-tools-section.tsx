"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const aiTools = [
  {
    title: "AI Chat",
    description: "Get instant answers to your questions on any subject",
    icon: "/ai-tutor-chat.png",
    link: "/ai/chat",
  },
  {
    title: "Math Assistant",
    description: "Solve complex math problems with step-by-step explanations",
    icon: "/digital-equation-solver.png",
    link: "/ai/math",
  },
  {
    title: "Essay Assistant",
    description: "Improve your writing with AI-powered feedback and suggestions",
    icon: "/digital-essay-workspace.png",
    link: "/ai/essay",
  },
  {
    title: "Code Assistant",
    description: "Learn programming concepts and get help with coding challenges",
    icon: "/interactive-code-lesson.png",
    link: "/ai/code",
  },
  {
    title: "Language Tutor",
    description: "Practice and improve your language skills through conversation",
    icon: "/multilingual-chat.png",
    link: "/ai/language",
  },
  {
    title: "Study Notes",
    description: "Generate comprehensive study notes from any text or lecture",
    icon: "/study-notes-generator-interface.png",
    link: "/ai/notes",
  },
]

export default function AIToolsSection() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">AI Learning Tools</h2>
        <p className="text-xl text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
          Explore our suite of specialized AI tools designed to enhance your learning experience
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiTools.map((tool, index) => (
            <Card key={index} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all">
              <div className="h-48 relative">
                <Image src={tool.icon || "/placeholder.svg"} alt={tool.title} fill className="object-cover" />
              </div>
              <CardHeader>
                <CardTitle>{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={tool.link}>Try Now</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
