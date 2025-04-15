"use client"

import type React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ProfilePictureUploadProps {
  userId: string
  currentImageUrl?: string
  onUpdate: (url: string) => void
}

export function ProfilePictureUpload({ userId, currentImageUrl, onUpdate }: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState(currentImageUrl || "")

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Get upload URL
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder: `users/${userId}/profile`,
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

      // Update profile picture in database
      const updateResponse = await fetch(`/api/users/${userId}/profile-picture`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: url }),
      })

      if (!updateResponse.ok) {
        throw new Error("Failed to update profile picture")
      }

      // Update state and call callback
      setImageUrl(url)
      onUpdate(url)

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully.",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your profile picture. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Get initials for avatar fallback
  const getInitials = () => {
    return "U"
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={imageUrl || "/placeholder.svg"} alt="Profile picture" />
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>

        <label
          htmlFor="profile-picture-upload"
          className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </label>

        <input
          id="profile-picture-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      <p className="text-sm text-gray-500 mt-2">Click the camera icon to upload a new profile picture</p>
    </div>
  )
}
