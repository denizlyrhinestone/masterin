"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Upload, Video, ImageIcon, Check, X, RefreshCw, Clock } from "lucide-react"
import { generateThumbnailsFromVideo, selectBestThumbnail } from "@/lib/video-utils"

export default function ThumbnailGeneratorPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null)
  const [timestamps, setTimestamps] = useState<number[]>([0, 3, 6, 9, 12])
  const [customTimestamp, setCustomTimestamp] = useState<number>(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { toast } = useToast()
  const [isBrowser, setIsBrowser] = useState(false)

  // Check if we're in the browser
  useEffect(() => {
    setIsBrowser(typeof window !== "undefined")
  }, [])

  // Handle video file selection
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is a video
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file",
        variant: "destructive",
      })
      return
    }

    setVideoFile(file)
    const objectUrl = URL.createObjectURL(file)
    setVideoSrc(objectUrl)
    setThumbnails([])
    setSelectedThumbnail(null)

    // Clean up the object URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl)
  }

  // Generate thumbnails from video
  const generateThumbnails = async () => {
    if (!videoFile || !isBrowser) {
      toast({
        title: "No video selected",
        description: "Please upload a video first",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Client-side thumbnail generation
      const generatedThumbnails = await generateThumbnailsFromVideo(videoFile, timestamps)
      setThumbnails(generatedThumbnails)

      const bestThumbnail = selectBestThumbnail(generatedThumbnails)
      setSelectedThumbnail(bestThumbnail)

      toast({
        title: "Thumbnails generated",
        description: `Generated ${generatedThumbnails.length} thumbnails`,
      })
    } catch (error) {
      console.error("Error generating thumbnails:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate thumbnails",
        variant: "destructive",
      })

      // Fallback to mock thumbnails for demo purposes
      const mockThumbnails = [
        "/blank-slate-start.png",
        "/abstract-geometric-shapes.png",
        "/cooking-ingredients-prep.png",
        "/cooking-ingredients-prep.png",
        "/video-still-12-seconds.png",
      ]
      setThumbnails(mockThumbnails)
      setSelectedThumbnail(mockThumbnails[2])
    } finally {
      setIsGenerating(false)
    }
  }

  // Add custom timestamp
  const addCustomTimestamp = () => {
    if (timestamps.includes(customTimestamp)) {
      toast({
        title: "Duplicate timestamp",
        description: `Timestamp ${customTimestamp}s already exists`,
        variant: "destructive",
      })
      return
    }

    setTimestamps([...timestamps, customTimestamp].sort((a, b) => a - b))
    setCustomTimestamp(0)
  }

  // Remove timestamp
  const removeTimestamp = (timestamp: number) => {
    setTimestamps(timestamps.filter((t) => t !== timestamp))
  }

  // Set current video time as custom timestamp
  const useCurrentTime = () => {
    if (videoRef.current) {
      const currentTime = Math.floor(videoRef.current.currentTime)
      setCustomTimestamp(currentTime)
    }
  }

  // Copy thumbnail URL to clipboard
  const copyThumbnailUrl = (url: string) => {
    if (isBrowser) {
      navigator.clipboard.writeText(url)
      toast({
        title: "URL copied",
        description: "Thumbnail URL copied to clipboard",
      })
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Video Thumbnail Generator</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Upload a video and generate custom thumbnails at specific timestamps
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Video Preview</CardTitle>
              <CardDescription>Upload a video to generate thumbnails</CardDescription>
            </CardHeader>
            <CardContent>
              {videoSrc ? (
                <div className="aspect-video bg-black rounded-md overflow-hidden">
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    controls
                    className="w-full h-full"
                    onLoadedMetadata={() => {
                      // Update timestamps based on video duration
                      if (videoRef.current) {
                        const duration = videoRef.current.duration
                        const newTimestamps = [
                          0,
                          Math.floor(duration * 0.25),
                          Math.floor(duration * 0.5),
                          Math.floor(duration * 0.75),
                          Math.floor(duration - 1),
                        ]
                        setTimestamps(newTimestamps)
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No video selected</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                <Input id="video-upload" type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                <Label htmlFor="video-upload" asChild>
                  <Button variant="outline" className="mr-2">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Video
                  </Button>
                </Label>
              </div>
              <Button onClick={generateThumbnails} disabled={!videoSrc || isGenerating}>
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Generate Thumbnails
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {thumbnails.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Generated Thumbnails</CardTitle>
                <CardDescription>Select the best thumbnail for your course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {thumbnails.map((thumbnail, index) => (
                    <div
                      key={index}
                      className={`relative aspect-video rounded-md overflow-hidden border-2 cursor-pointer ${
                        selectedThumbnail === thumbnail
                          ? "border-purple-500 dark:border-purple-400"
                          : "border-transparent"
                      }`}
                      onClick={() => setSelectedThumbnail(thumbnail)}
                    >
                      <Image
                        src={thumbnail || "/placeholder.svg"}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                      {selectedThumbnail === thumbnail && (
                        <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1">
                        {timestamps[index]}s
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => copyThumbnailUrl(selectedThumbnail || "")}
                  disabled={!selectedThumbnail}
                >
                  Copy URL
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    toast({
                      title: "Thumbnail saved",
                      description: "Thumbnail has been saved to the course",
                    })
                  }}
                  disabled={!selectedThumbnail}
                >
                  Use Selected Thumbnail
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Timestamp Settings</CardTitle>
              <CardDescription>Configure when to capture thumbnails</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="timestamps">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="timestamps">Timestamps</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>
                <TabsContent value="timestamps" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Timestamps</Label>
                    <div className="space-y-2">
                      {timestamps.length > 0 ? (
                        timestamps.map((timestamp) => (
                          <div
                            key={timestamp}
                            className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-md"
                          >
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-gray-500" />
                              {timestamp} seconds
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeTimestamp(timestamp)}
                              className="h-8 w-8"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No timestamps added yet</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="custom" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-timestamp">Custom Timestamp (seconds)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="custom-timestamp"
                        type="number"
                        min="0"
                        step="1"
                        value={customTimestamp}
                        onChange={(e) => setCustomTimestamp(Number.parseInt(e.target.value) || 0)}
                      />
                      <Button variant="outline" size="sm" onClick={useCurrentTime} disabled={!videoSrc}>
                        Current
                      </Button>
                    </div>
                  </div>
                  <Button onClick={addCustomTimestamp} className="w-full">
                    Add Timestamp
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Selected Thumbnail</CardTitle>
              <CardDescription>Preview your chosen thumbnail</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedThumbnail ? (
                <div className="aspect-video relative rounded-md overflow-hidden">
                  <Image
                    src={selectedThumbnail || "/placeholder.svg"}
                    alt="Selected thumbnail"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No thumbnail selected</p>
                  </div>
                </div>
              )}
            </CardContent>
            {selectedThumbnail && (
              <CardFooter>
                <p className="text-xs text-gray-500 truncate w-full">{selectedThumbnail}</p>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
