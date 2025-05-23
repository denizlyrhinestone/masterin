import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Video, Headphones, BookOpen } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Resources - Masterin",
  description: "Educational resources to enhance your learning",
}

export default function ResourcesPage() {
  const resources = [
    {
      id: 1,
      title: "AI Learning Guide",
      description: "A comprehensive guide to getting started with AI",
      type: "PDF",
      icon: FileText,
      href: "#",
    },
    {
      id: 2,
      title: "Introduction to Machine Learning",
      description: "Video tutorial series on machine learning basics",
      type: "Video",
      icon: Video,
      href: "#",
    },
    {
      id: 3,
      title: "AI in Education Podcast",
      description: "Weekly podcast discussing AI applications in education",
      type: "Podcast",
      icon: Headphones,
      href: "#",
    },
    {
      id: 4,
      title: "Data Science Handbook",
      description: "Complete reference for data science concepts and techniques",
      type: "E-Book",
      icon: BookOpen,
      href: "#",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Learning Resources</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Free educational resources to support your learning journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
                  <resource.icon className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>{resource.title}</CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">{resource.type}</span>
                  <Link href={resource.href}>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
