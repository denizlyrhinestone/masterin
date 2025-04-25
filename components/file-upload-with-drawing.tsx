"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PaperclipIcon, Upload, X, Loader2, Pencil } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { validateFile, type UploadedFile, uploadFile } from "@/lib/file-upload"
import DrawingCanvas from "./drawing-canvas"

interface FileUploadWithDrawingProps {
  onFileUploaded: (file: UploadedFile) => void
  onDrawingUploaded: (imageData: string) => void
  disabled?: boolean
}

export default function FileUploadWithDrawing({
  onFileUploaded,
  onDrawingUploaded,
  disabled = false,
}: FileUploadWithDrawingProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDrawingMode, setIsDrawingMode] = useState(false)
  const [drawingError, setDrawingError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Effect to handle orientation changes when in drawing mode
  useEffect(() => {
    if (!isDrawingMode) return

    const handleOrientationChange = () => {
      // Force a re-render of the drawing canvas container
      const timer = setTimeout(() => {
        const event = new Event("resize")
        window.dispatchEvent(event)
      }, 300)

      return () => clearTimeout(timer)
    }

    window.addEventListener("orientationchange", handleOrientationChange)
    return () => window.removeEventListener("orientationchange", handleOrientationChange)
  }, [isDrawingMode])

  const handleFileSelect = (file: File) => {
    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      toast({
        title: "Invalid file",
        description: validation.error,
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)

    try {
      // Upload the file using our utility function
      const uploadedFile = await uploadFile(selectedFile)

      if (!uploadedFile) {
        throw new Error("Failed to upload file")
      }

      // Clear selected file
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Notify parent component
      onFileUploaded(uploadedFile)

      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleDrawingButtonClick = () => {
    setIsDrawingMode(true)
    setDrawingError(null)
  }

  const handleDrawingSend = (imageData: string) => {
    if (imageData && imageData.startsWith("data:image/")) {
      try {
        // Validate image data
        const img = new Image()
        img.onload = () => {
          // Image is valid, proceed with upload
          onDrawingUploaded(imageData)
          setIsDrawingMode(false)
          setDrawingError(null)
        }
        img.onerror = () => {
          throw new Error("Invalid image data")
        }
        img.src = imageData
      } catch (error) {
        console.error("Drawing validation error:", error)
        setDrawingError("Could not process drawing. Please try again.")
        toast({
          title: "Drawing error",
          description: "Could not process drawing. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      setDrawingError("Invalid drawing data")
      toast({
        title: "Drawing error",
        description: "Could not create drawing. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDrawingClose = () => {
    setIsDrawingMode(false)
    setDrawingError(null)
  }

  if (isDrawingMode) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
        {drawingError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative" role="alert">
            <span className="block sm:inline">{drawingError}</span>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-0 right-0 mt-1 mr-1"
              onClick={() => setDrawingError(null)}
            >
              Dismiss
            </Button>
          </div>
        )}
        <DrawingCanvas onSend={handleDrawingSend} onClose={handleDrawingClose} />
      </div>
    )
  }

  return (
    <div className="w-full flex items-center">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* File selection area */}
      {!selectedFile ? (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleButtonClick}
            disabled={disabled || isUploading}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <PaperclipIcon className="h-5 w-5" />
            <span className="sr-only">Attach file</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDrawingButtonClick}
            disabled={disabled || isUploading}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Pencil className="h-5 w-5" />
            <span className="sr-only">Create drawing</span>
          </Button>
        </div>
      ) : (
        <div className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md w-full">
          <div className="flex-1 truncate text-sm">{selectedFile.name}</div>
          <div className="flex space-x-1">
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={handleUpload} className="h-7 w-7 p-0">
                  <Upload className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
