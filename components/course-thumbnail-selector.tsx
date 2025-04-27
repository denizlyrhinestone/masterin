"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { ImageIcon, Upload, RefreshCw } from "lucide-react"

interface CourseThumbnailSelectorProps {
  courseId: string
  currentThumbnail?: string
  videoUrl?: string
  onThumbnailSelect: (thumbnailUrl: string) => void
}

export default function CourseThumbnailSelector({
  courseId,
  currentThumbnail,
  videoUrl,
  onThumbnailSelect,
}: CourseThumbnailSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("generated")
  const [isLoading, setIsLoading] = useState(false)
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null)
  const { toast } = useToast()

  // Load thumbnails when dialog opens
  useEffect(() => {
    if (isOpen && videoUrl) {
      loadThumbnails()
    }
  }, [isOpen, videoUrl])

  // Set initial selected thumbnail
  useEffect(() => {
    if (currentThumbnail) {
      setSelectedThumbnail(currentThumbnail)
    }
  }, [currentThumbnail])

  // Load existing thumbnails for this course
  const loadThumbnails = async () => {
    if (!videoUrl) return

    setIsLoading(true)

    try {
      // Simulate API call to get thumbnails
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Use placeholder images for demo
      const mockThumbnails = [
        `/placeholder.svg?height=720&width=1280&query=course ${courseId} thumbnail 1`,
        `/placeholder.svg?height=720&width=1280&query=course ${courseId} thumbnail 2`,
        `/placeholder.svg?height=720&width=1280&query=course ${courseId} thumbnail 3`,
        `/placeholder.svg?height=720&width=1280&query=course ${courseId} thumbnail 4`,
      ]

      setThumbnails(mockThumbnails)

      // If no thumbnail is selected yet, select the first one
      if (!selectedThumbnail && mockThumbnails.length > 0) {
        setSelectedThumbnail(mockThumbnails[0])
      }
    } catch (error) {
      console.error("Error loading thumbnails:", error)
      toast({
        title: "Error",
        description: "Failed to load thumbnails",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle thumbnail selection
  const handleSelectThumbnail = (thumbnail: string) => {
    setSelectedThumbnail(thumbnail)
  }

  // Apply selected thumbnail
  const applySelectedThumbnail = () => {
    if (selectedThumbnail) {
      onThumbnailSelect(selectedThumbnail)
      setIsOpen(false)

      toast({
        title: "Thumbnail updated",
        description: "Course thumbnail has been updated successfully",
      })
    }
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    // For the v0 preview, we'll use a placeholder image
    const placeholderUrl = `/placeholder.svg?height=720&width=1280&query=custom uploaded thumbnail`
    setSelectedThumbnail(placeholderUrl)
    setThumbnails([placeholderUrl, ...thumbnails])
    setActiveTab("uploaded")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ImageIcon className="mr-2 h-4 w-4" />
          Change Thumbnail
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Select Course Thumbnail</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generated">Generated</TabsTrigger>
            <TabsTrigger value="uploaded">Upload New</TabsTrigger>
          </TabsList>

          <TabsContent value="generated" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : thumbnails.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {thumbnails.map((thumbnail, index) => (
                  <div
                    key={index}
                    className={`relative aspect-video rounded-md overflow-hidden border-2 cursor-pointer ${
                      selectedThumbnail === thumbnail
                        ? "border-purple-500 dark:border-purple-400"
                        : "border-transparent"
                    }`}
                    onClick={() => handleSelectThumbnail(thumbnail)}
                  >
                    <Image
                      src={thumbnail || "/placeholder.svg"}
                      alt={`Thumbnail option ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No thumbnails generated yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Go to the admin panel to generate thumbnails from your course video
                </p>
                <Button className="mt-4" variant="outline" asChild>
                  <a href="/admin/thumbnails" target="_blank" rel="noopener noreferrer">
                    Generate Thumbnails
                  </a>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="uploaded" className="space-y-4">
            <Card>
              <CardContent className="py-6">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="thumbnail-upload"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or WEBP (MAX. 2MB)</p>
                      </div>
                      <input
                        id="thumbnail-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>

                  {selectedThumbnail && activeTab === "uploaded" && (
                    <div className="w-full max-w-md">
                      <p className="text-sm font-medium mb-2">Preview:</p>
                      <div className="relative aspect-video rounded-md overflow-hidden">
                        <Image
                          src={selectedThumbnail || "/placeholder.svg"}
                          alt="Uploaded thumbnail preview"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={applySelectedThumbnail} disabled={!selectedThumbnail}>
            Apply Thumbnail
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
