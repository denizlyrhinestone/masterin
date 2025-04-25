"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Maximize2, Minimize2 } from "lucide-react"

interface DrawingMessageProps {
  imageData: string
  alt?: string
}

export default function DrawingMessage({ imageData, alt = "Drawing" }: DrawingMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const downloadDrawing = () => {
    const link = document.createElement("a")
    link.href = imageData
    link.download = `drawing-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="relative group">
      <div
        className={`relative ${isExpanded ? "fixed inset-0 z-50 flex items-center justify-center bg-black/70" : ""}`}
      >
        <img
          src={imageData || "/placeholder.svg"}
          alt={alt}
          className={`
            ${isExpanded ? "max-h-[90vh] max-w-[90vw] object-contain" : "max-h-60 rounded-md"}
            border border-gray-200 dark:border-gray-700
          `}
        />

        {isExpanded && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="secondary" size="icon" onClick={downloadDrawing} className="rounded-full">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={toggleExpand} className="rounded-full">
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {!isExpanded && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleExpand}
            className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70"
          >
            <Maximize2 className="h-4 w-4 text-white" />
          </Button>
        </div>
      )}
    </div>
  )
}
