"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { PaperclipIcon, Upload, X, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { validateFile, type UploadedFile } from "@/lib/file-upload"

interface FileUploadProps {
  onFileUploaded: (file: UploadedFile) => void
  disabled?: boolean
}

export default function FileUpload({ onFileUploaded, disabled = false }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to upload file")
      }

      const uploadedFile = await response.json()

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

  return (
    <div className="w-full">
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
      ) : (
        <div className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
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
