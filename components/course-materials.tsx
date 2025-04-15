"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "@/components/file-upload"
import { FileText, Download, Trash2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Material {
  id: string
  title: string
  url: string
  type: string
  size: number
  uploadedAt: string
}

interface CourseMaterialsProps {
  courseId: string
  isInstructor?: boolean
}

export function CourseMaterials({ courseId, isInstructor = false }: CourseMaterialsProps) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)

  // Fetch course materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/courses/${courseId}/materials`)

        if (response.ok) {
          const data = await response.json()
          setMaterials(data.materials)
        }
      } catch (error) {
        console.error("Failed to fetch materials:", error)
        toast({
          title: "Error",
          description: "Failed to load course materials",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMaterials()
  }, [courseId])

  const handleUploadComplete = async (url: string) => {
    try {
      // Extract filename from URL
      const filename = url.split("/").pop() || "Untitled"
      const title = filename.substring(filename.indexOf("-") + 1)

      // Save material to database
      const response = await fetch(`/api/courses/${courseId}/materials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          url,
          type: getFileType(title),
        }),
      })

      if (response.ok) {
        const newMaterial = await response.json()
        setMaterials([...materials, newMaterial])
        setShowUpload(false)

        toast({
          title: "Material added",
          description: "The course material has been added successfully.",
        })
      } else {
        throw new Error("Failed to save material")
      }
    } catch (error) {
      console.error("Failed to add material:", error)
      toast({
        title: "Error",
        description: "Failed to add course material",
        variant: "destructive",
      })
    }
  }

  const deleteMaterial = async (id: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/materials/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMaterials(materials.filter((material) => material.id !== id))

        toast({
          title: "Material deleted",
          description: "The course material has been deleted.",
        })
      } else {
        throw new Error("Failed to delete material")
      }
    } catch (error) {
      console.error("Failed to delete material:", error)
      toast({
        title: "Error",
        description: "Failed to delete course material",
        variant: "destructive",
      })
    }
  }

  const getFileType = (filename: string): string => {
    const extension = filename.split(".").pop()?.toLowerCase() || ""

    if (["pdf"].includes(extension)) return "PDF"
    if (["doc", "docx"].includes(extension)) return "Document"
    if (["ppt", "pptx"].includes(extension)) return "Presentation"
    if (["jpg", "jpeg", "png", "gif"].includes(extension)) return "Image"
    if (["mp4", "webm", "mov"].includes(extension)) return "Video"

    return "File"
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Course Materials</CardTitle>
        {isInstructor && (
          <Button onClick={() => setShowUpload(!showUpload)} variant="outline" size="sm">
            {showUpload ? "Cancel" : "Add Material"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {showUpload && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Upload New Material</h3>
            <FileUpload
              onUploadComplete={handleUploadComplete}
              folder={`courses/${courseId}/materials`}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4"
              buttonText="Upload Course Material"
            />
          </div>
        )}

        {materials.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>No materials available for this course yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {materials.map((material) => (
              <div
                key={material.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-3 text-blue-500" />
                  <div>
                    <h4 className="font-medium">{material.title}</h4>
                    <div className="text-xs text-gray-500">
                      {material.type} • {formatFileSize(material.size)} •
                      {new Date(material.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <a href={material.url} target="_blank" rel="noopener noreferrer" download>
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </a>
                  </Button>

                  {isInstructor && (
                    <Button variant="ghost" size="sm" onClick={() => deleteMaterial(material.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
