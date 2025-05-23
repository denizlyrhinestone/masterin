"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react"

interface PDFPreviewProps {
  pages: string[]
  title: string
  onClose: () => void
  onDownload: () => void
}

export function PDFPreview({ pages, title, onClose, onDownload }: PDFPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0)

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setCurrentPage((prev) => (prev < pages.length - 1 ? prev + 1 : prev))
      } else if (e.key === "ArrowLeft") {
        setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev))
      } else if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [pages.length, onClose])

  if (pages.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl bg-white dark:bg-gray-900 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title} - Preview</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Page {currentPage + 1} of {pages.length}
            </span>
            <Button variant="outline" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="shadow-lg max-h-full">
            <img
              src={pages[currentPage] || "/placeholder.svg"}
              alt={`Page ${currentPage + 1}`}
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>
        </div>

        <div className="p-4 border-t flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => (prev < pages.length - 1 ? prev + 1 : prev))}
              disabled={currentPage === pages.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          <Button onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </Card>
    </div>
  )
}
