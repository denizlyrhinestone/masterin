"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2, Copy, Download, ThumbsUp, ThumbsDown, RefreshCw, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ContentGeneratorPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [contentType, setContentType] = useState("blog")
  const [tone, setTone] = useState("professional")
  const [length, setLength] = useState([500])
  const [includeKeywords, setIncludeKeywords] = useState("")
  const [useAI, setUseAI] = useState(true)
  const [generatedContent, setGeneratedContent] = useState("")

  // Content type options
  const contentTypes = [
    { value: "blog", label: "Blog Post" },
    { value: "social", label: "Social Media" },
    { value: "email", label: "Email" },
    { value: "marketing", label: "Marketing Copy" },
    { value: "academic", label: "Academic" },
  ]

  // Tone options
  const tones = [
    { value: "professional", label: "Professional" },
    { value: "casual", label: "Casual" },
    { value: "enthusiastic", label: "Enthusiastic" },
    { value: "formal", label: "Formal" },
    { value: "humorous", label: "Humorous" },
  ]

  // Sample templates for different content types
  const templates = {
    blog: "How to Improve Your Study Habits",
    social: "Announcing our new AI-powered study tools!",
    email: "Welcome to our learning platform",
    marketing: "Transform your learning experience with AI",
    academic: "The impact of artificial intelligence on education",
  }

  // Function to handle content generation
  const generateContent = async () => {
    if (!prompt) {
      toast({
        title: "Please enter a prompt",
        description: "You need to provide a topic or prompt to generate content.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setGeneratedContent("")

    try {
      // In a real implementation, this would call an API
      // For demo purposes, we'll simulate a delay and return mock content
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate mock content based on the input parameters
      const mockContent = generateMockContent(prompt, contentType, tone, length[0], includeKeywords)
      setGeneratedContent(mockContent)
    } catch (error) {
      toast({
        title: "Error generating content",
        description: "There was an error generating your content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Function to generate mock content (in a real app, this would be an API call)
  const generateMockContent = (prompt: string, type: string, tone: string, length: number, keywords: string) => {
    const keywordsList = keywords ? keywords.split(",").map((k) => k.trim()) : []

    // Create a mock response based on the parameters
    let content = ""

    if (type === "blog") {
      content = `# ${prompt}\n\n`
      content += `In today's fast-paced educational landscape, ${prompt.toLowerCase()} has become increasingly important. `
      content += `This comprehensive guide will explore effective strategies and practical tips to help you excel in this area.\n\n`
      content += `## Why ${prompt} Matters\n\n`
      content += `Understanding ${prompt.toLowerCase()} can significantly impact your academic performance and professional development. `

      if (keywordsList.length > 0) {
        content += `Key concepts like ${keywordsList.join(", ")} play a crucial role in mastering this subject.\n\n`
      }

      content += `## Practical Strategies\n\n`
      content += `1. **Start with clear goals**: Define what you want to achieve with ${prompt.toLowerCase()}\n`
      content += `2. **Develop a routine**: Consistency is key to improvement\n`
      content += `3. **Use technology wisely**: Leverage AI tools to enhance your learning\n`
      content += `4. **Practice regularly**: Apply what you learn in real-world scenarios\n\n`

      content += `## Conclusion\n\n`
      content += `By implementing these strategies, you'll be well on your way to mastering ${prompt.toLowerCase()} and achieving your educational goals.`
    } else if (type === "social") {
      content = `📣 ${prompt} 📣\n\n`
      content += `Did you know that mastering ${prompt.toLowerCase()} can transform your learning experience? `

      if (keywordsList.length > 0) {
        content += `Discover how ${keywordsList.join(", ")} can help you excel! `
      }

      content += `\n\nCheck out our latest guide at masterin.org to learn more! #Education #Learning #${prompt.replace(/\s+/g, "")}`
    } else {
      content = `${prompt}\n\n`
      content += `This is a sample ${type} about ${prompt.toLowerCase()}. `

      if (keywordsList.length > 0) {
        content += `It includes key concepts like ${keywordsList.join(", ")}. `
      }

      content += `The tone is ${tone} and it's approximately ${length} characters long.`
    }

    // Adjust content length (roughly)
    if (content.length > length) {
      return content.substring(0, length) + "..."
    }

    return content
  }

  // Function to copy content to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent)
    toast({
      title: "Copied to clipboard",
      description: "The generated content has been copied to your clipboard.",
    })
  }

  // Function to download content as a text file
  const downloadContent = () => {
    const element = document.createElement("a")
    const file = new Blob([generatedContent], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${prompt.substring(0, 20).replace(/\s+/g, "-")}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Content Generator</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Create high-quality content for blogs, social media, emails, and more
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Content Settings</CardTitle>
                <CardDescription>Configure your content generation parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Topic or Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Enter your topic or prompt..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const currentType = contentType as keyof typeof templates
                        setPrompt(templates[currentType])
                      }}
                    >
                      Use template
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content-type">Content Type</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger id="content-type">
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger id="tone">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="length">Length (characters)</Label>
                    <span className="text-sm text-gray-500">{length[0]}</span>
                  </div>
                  <Slider id="length" min={100} max={2000} step={100} value={length} onValueChange={setLength} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Include Keywords (comma separated)</Label>
                  <Input
                    id="keywords"
                    placeholder="e.g., education, learning, AI"
                    value={includeKeywords}
                    onChange={(e) => setIncludeKeywords(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="use-ai" checked={useAI} onCheckedChange={setUseAI} />
                  <Label htmlFor="use-ai">Use AI enhancement</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={generateContent} disabled={loading || !prompt}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Content
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Generated Content</CardTitle>
                <CardDescription>Your AI-generated content will appear here</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Generating your content...</p>
                  </div>
                ) : generatedContent ? (
                  <div className="relative">
                    <div className="prose dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-auto max-h-[500px]">
                        {generatedContent}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Sparkles className="h-8 w-8 text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Your content will appear here</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 max-w-md">
                      Configure your settings and click "Generate Content" to create AI-powered content
                    </p>
                  </div>
                )}
              </CardContent>
              {generatedContent && (
                <CardFooter className="flex flex-col sm:flex-row gap-4 border-t pt-6">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadContent}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={generateContent}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                  <div className="flex gap-2 ml-auto">
                    <Button variant="ghost" size="icon">
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
