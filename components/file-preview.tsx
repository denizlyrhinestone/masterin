"use client"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FilePreviewProps {
  url: string
  filename: string
  fileType: string
  contentType: string
  showRemove?: boolean
  onRemove?: () => void
}

export default function FilePreview({
  url,
  filename,
  fileType,
  contentType,
  showRemove = true,
  onRemove,
}: FilePreviewProps) {
  // Determine the appropriate preview based on file type
  const renderPreview = () => {
    if (fileType === "image") {
      return (
        <div className="relative">
          <img src={url || "/placeholder.svg"} alt={filename} className="max-h-40 max-w-full rounded object-contain" />
        </div>
      )
    } else if (contentType === "application/pdf") {
      return (
        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <svg className="h-8 w-8 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium truncate">{filename}</p>
            <p className="text-xs text-gray-500">PDF Document</p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-purple-600 hover:text-purple-800 text-sm"
          >
            View
          </a>
        </div>
      )
    } else if (contentType.includes("text/")) {
      return (
        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <svg className="h-8 w-8 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium truncate">{filename}</p>
            <p className="text-xs text-gray-500">Text Document</p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-purple-600 hover:text-purple-800 text-sm"
          >
            View
          </a>
        </div>
      )
    } else if (contentType.includes("spreadsheet") || contentType.includes("csv")) {
      return (
        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <svg className="h-8 w-8 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium truncate">{filename}</p>
            <p className="text-xs text-gray-500">Spreadsheet</p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-purple-600 hover:text-purple-800 text-sm"
          >
            View
          </a>
        </div>
      )
    } else if (contentType.includes("wordprocessing")) {
      return (
        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <svg className="h-8 w-8 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium truncate">{filename}</p>
            <p className="text-xs text-gray-500">Word Document</p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-purple-600 hover:text-purple-800 text-sm"
          >
            View
          </a>
        </div>
      )
    } else {
      // Generic file preview
      return (
        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <svg className="h-8 w-8 text-gray-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium truncate">{filename}</p>
            <p className="text-xs text-gray-500">{contentType}</p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-purple-600 hover:text-purple-800 text-sm"
          >
            View
          </a>
        </div>
      )
    }
  }

  return (
    <div className="relative">
      {renderPreview()}
      {showRemove && onRemove && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 p-0 hover:bg-gray-300 dark:hover:bg-gray-600"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Remove file</span>
        </Button>
      )}
    </div>
  )
}
