"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Maximize2, Minimize2 } from "lucide-react"

interface DrawingMessageProps {
  imageData: string
  alt?: string
}

export default function DrawingMessage({ imageData, alt = "Drawing" }: DrawingMessageProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

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
      // Validate imageData before attempting to download
      if (!imageData || !imageData.startsWith("data:")) {
        console.error("Invalid image data for download")
        setError("Invalid image data")
        return
      }

      const link = document.createElement("a")
      link.href = imageData
      link.download = `drawing-${new Date().toISOString().slice(0, 10)}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error downloading image:", error)
      setError("Download failed")
    }
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="relative max-w-full max-h-full">
          {error ? (
            <div className="bg-gray-800 rounded-md p-6 text-center">
              <p className="text-red-400">{error}</p>
              <p className="text-sm text-gray-400 mt-2">The drawing could not be displayed</p>
              <Button variant="outline" size="sm" onClick={toggleFullscreen} className="mt-4">
                <Minimize2 className="h-4 w-4 mr-2" /> Close
              </Button>
            </div>
          ) : (
            <>
              <img
                src={imageData || "/placeholder.svg"}
                alt={alt}
                className="max-w-full max-h-[90vh] object-contain"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button variant="outline" size="icon" onClick={handleDownload} className="bg-white/20">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={toggleFullscreen} className="bg-white/20">
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative group">
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
            className="max-h-60 rounded-md"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          {loaded && (
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="outline" size="icon" onClick={handleDownload} className="bg-white/20">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={toggleFullscreen} className="bg-white/20">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
