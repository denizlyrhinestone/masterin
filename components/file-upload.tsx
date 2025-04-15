"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, FileText, ImageIcon, Film, File } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface FileUploadProps {
  onUploadComplete: (url: string) => void
  folder?: string
  accept?: string
  maxSizeMB?: number
  buttonText?: string
}

export function FileUpload({
  onUploadComplete,
  folder = "uploads",
  accept = "*/*",
  maxSizeMB = 10,
  buttonText = "Upload File",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${maxSizeMB}MB`,
        variant: "destructive",
      })
      return
    }

    setFileName(file.name)

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }

    // Upload the file
    setIsUploading(true)
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get upload URL")
      }

      const { uploadUrl, url } = await response.json()

      // Upload to the presigned URL
      await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      })

      // Call the callback with the final URL
      onUploadComplete(url)

      toast({
        title: "Upload complete",
        description: "Your file has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const clearFile = () => {
    setPreview(null)
    setFileName(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getFileIcon = () => {
    if (!fileName) return <File className="h-8 w-8 text-gray-400" />

    const extension = fileName.split(".").pop()?.toLowerCase()

    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension || "")) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />
    } else if (["mp4", "webm", "mov", "avi"].includes(extension || "")) {
      return <Film className="h-8 w-8 text-purple-500" />
    } else if (["pdf", "doc", "docx", "txt"].includes(extension || "")) {
      return <FileText className="h-8 w-8 text-red-500" />
    }

    return <File className="h-8 w-8 text-gray-400" />
  }

  return (
    <div className="w-full">
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        disabled={isUploading}
      />

      {!preview && !fileName ? (
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg"
          variant="ghost"
        >
          <Upload className="h-8 w-8 mb-2 text-gray-400" />
          <span>{isUploading ? "Uploading..." : buttonText}</span>
          <span className="text-xs text-gray-500 mt-1">Max size: {maxSizeMB}MB</span>
        </Button>
      ) : (
        <div className="relative w-full h-32 border rounded-lg overflow-hidden">
          {preview ? (
            <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              {getFileIcon()}
              <span className="text-sm mt-2 text-center px-4 truncate max-w-full">{fileName}</span>
            </div>
          )}

          <Button
            onClick={clearFile}
            className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
            variant="destructive"
            size="sm"
          >
            <X className="h-4 w-4" />
          </Button>

          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
