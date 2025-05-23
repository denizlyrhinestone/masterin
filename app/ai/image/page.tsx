"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Loader2, Download, Copy, Share2, ImagePlus } from "lucide-react"
import Image from "next/image"

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("")
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [imageStyle, setImageStyle] = useState("realistic")
  const [aspectRatio, setAspectRatio] = useState("square")

  const handleGenerate = () => {
    if (!prompt.trim()) return

    setGenerating(true)

    // Simulate image generation with a timeout
    setTimeout(() => {
      setGenerating(false)
      setGenerated(true)
    }, 3000)
  }

  const getImageDimensions = () => {
    switch (aspectRatio) {
      case "square":
        return { width: 512, height: 512 }
      case "portrait":
        return { width: 512, height: 768 }
      case "landscape":
        return { width: 768, height: 512 }
      case "wide":
        return { width: 896, height: 512 }
      default:
        return { width: 512, height: 512 }
    }
  }

  const placeholderUrl = `/placeholder.svg?height=${getImageDimensions().height}&width=${getImageDimensions().width}&query=educational image of science concept with atoms and molecules`

  const styleSuggestions = {
    educational: [
      "anatomical diagram of the human heart",
      "cross-section of a plant cell with labeled parts",
      "visual representation of the water cycle",
      "diagram of the solar system",
      "illustration of DNA structure",
    ],
    infographic: [
      "timeline of world history major events",
      "comparison chart of renewable energy sources",
      "step-by-step guide to the scientific method",
      "statistics visualization of global literacy rates",
      "flowchart of photosynthesis process",
    ],
    illustration: [
      "children's book style illustration of dinosaurs",
      "watercolor style painting of different ecosystems",
      "cartoon character teaching math concepts",
      "colorful illustration of the periodic table",
      "storybook scene of historical events",
    ],
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <h1 className="text-4xl font-bold mb-2">Educational Image Generator</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Create custom educational visuals to enhance learning materials
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Image Generator</CardTitle>
            <CardDescription>Describe the educational image you want to create</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Image Description</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the educational image you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                Be specific about educational content, style, colors, and elements to include.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="style">Image Style</Label>
              <Select defaultValue={imageStyle} onValueChange={(value) => setImageStyle(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realistic">Realistic</SelectItem>
                  <SelectItem value="cartoon">Cartoon</SelectItem>
                  <SelectItem value="diagram">Diagram</SelectItem>
                  <SelectItem value="infographic">Infographic</SelectItem>
                  <SelectItem value="illustration">Illustration</SelectItem>
                  <SelectItem value="3d">3D Render</SelectItem>
                  <SelectItem value="watercolor">Watercolor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ratio">Aspect Ratio</Label>
              <Select defaultValue={aspectRatio} onValueChange={(value) => setAspectRatio(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select aspect ratio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square (1:1)</SelectItem>
                  <SelectItem value="portrait">Portrait (2:3)</SelectItem>
                  <SelectItem value="landscape">Landscape (3:2)</SelectItem>
                  <SelectItem value="wide">Wide (16:9)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="complexity">Complexity</Label>
                <span className="text-xs text-muted-foreground">Medium</span>
              </div>
              <Slider defaultValue={[50]} max={100} step={1} />
            </div>

            <div className="space-y-2">
              <Label>Prompt Suggestions</Label>
              <Tabs defaultValue="educational">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="educational">Educational</TabsTrigger>
                  <TabsTrigger value="infographic">Infographic</TabsTrigger>
                  <TabsTrigger value="illustration">Illustration</TabsTrigger>
                </TabsList>

                {Object.entries(styleSuggestions).map(([key, suggestions]) => (
                  <TabsContent key={key} value={key} className="mt-2">
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => setPrompt(suggestion)}
                          className="text-xs"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled={generating || !prompt.trim()} onClick={handleGenerate}>
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Image...
                </>
              ) : (
                <>
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Generate Image
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Generated Image</CardTitle>
            <CardDescription>
              {generated
                ? "Your educational image is ready to download or share"
                : "Your generated image will appear here"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className={`rounded-md overflow-hidden border ${generating ? "animate-pulse" : ""}`}>
              {generating ? (
                <div
                  className="bg-muted flex items-center justify-center"
                  style={{ width: getImageDimensions().width, height: getImageDimensions().height }}
                >
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div
                  className="relative"
                  style={{ width: getImageDimensions().width, height: getImageDimensions().height }}
                >
                  <Image
                    src={placeholderUrl || "/placeholder.svg"}
                    alt="Generated educational image"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2 justify-center">
            <Button variant="outline" disabled={!generated}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" disabled={!generated}>
              <Copy className="mr-2 h-4 w-4" />
              Copy to Clipboard
            </Button>
            <Button variant="outline" disabled={!generated}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button disabled={!generated}>Save to Library</Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Educational Image Gallery</h2>
        <p className="text-muted-foreground mb-6">Browse examples of educational images created with our generator</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-md overflow-hidden border hover:shadow-md transition-shadow">
              <div className="relative aspect-square">
                <Image
                  src={`/educational-diagram.png?height=300&width=300&query=educational diagram ${i + 1}`}
                  alt={`Educational image example ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
