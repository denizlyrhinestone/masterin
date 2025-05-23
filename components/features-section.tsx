"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Code, Languages, Calculator, FileText, MessageSquare } from "lucide-react"

const features = [
  {
    icon: <BookOpen className="h-10 w-10 text-purple-500" />,
    title: "Study Notes Generator",
    description: "Create comprehensive study notes from any text or lecture material.",
  },
  {
    icon: <Code className="h-10 w-10 text-purple-500" />,
    title: "Code Assistant",
    description: "Get help with programming concepts, debugging, and code optimization.",
  },
  {
    icon: <Languages className="h-10 w-10 text-purple-500" />,
    title: "Language Tutor",
    description: "Practice and improve your language skills with interactive conversations.",
  },
  {
    icon: <Calculator className="h-10 w-10 text-purple-500" />,
    title: "Math Assistant",
    description: "Solve complex math problems with step-by-step explanations.",
  },
  {
    icon: <FileText className="h-10 w-10 text-purple-500" />,
    title: "Essay Assistant",
    description: "Get feedback and suggestions to improve your writing skills.",
  },
  {
    icon: <MessageSquare className="h-10 w-10 text-purple-500" />,
    title: "AI Chat",
    description: "Ask questions and get instant answers on any academic topic.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Powerful AI Learning Tools</h2>
        <p className="text-xl text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
          Our suite of AI-powered tools designed to enhance your learning experience and help you achieve your academic
          goals.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="mb-2">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
