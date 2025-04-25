"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface DrawingMessageProps {
  imageData: string
  alt?: string
}

export default function DrawingMessage({ imageData, alt = "Drawing" }: DrawingMessageProps) {
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const handleImageError = () => {
    setError("Failed to load drawing")
    console.error("Failed to load drawing image")
  }

  const handleImageLoad = () => {
    setLoaded(true)
    setError(null)
  }

  const handleDownload = () => {
    try {
      // Validate image data before download
      if (!imageData || !imageData.startsWith("data:image/")) {
        throw new Error("Invalid image data")
      }

      const link = document.createElement("a")
      link.href = imageData
      link.download = `drawing-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Download error:", error)
      setError("Failed to download drawing")
    }
  }

  return (
    <div className="relative">
      {error ? (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 text-center">
          <p className="text-red-500">{error}</p>
          <p className="text-sm text-gray-500">The drawing could not be displayed</p>
        </div>
      ) : (
        <>
          <img
            src={imageData || "/placeholder.svg"}
            alt={alt}
            className="max-w-full rounded-md border border-gray-200 dark:border-gray-700"
            style={{ maxHeight: "300px" }}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          {loaded && (
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 bg-white/80 dark:bg-gray-800/80"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-1" />
              Save
            </Button>
          )}
        </>
      )}
    </div>
  )
}
