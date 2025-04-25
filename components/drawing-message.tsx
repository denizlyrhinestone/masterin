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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = imageData
    link.download = `drawing-${new Date().toISOString().slice(0, 10)}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="relative max-w-full max-h-full">
          <img src={imageData || "/placeholder.svg"} alt={alt} className="max-w-full max-h-[90vh] object-contain" />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button variant="outline" size="icon" onClick={handleDownload} className="bg-white/20">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={toggleFullscreen} className="bg-white/20">
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative group">
      <img src={imageData || "/placeholder.svg"} alt={alt} className="max-h-60 rounded-md" />
      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="outline" size="icon" onClick={handleDownload} className="bg-white/20">
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={toggleFullscreen} className="bg-white/20">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
