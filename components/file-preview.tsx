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
    } else if (contentType.includes("application/json") || filename.endsWith(".json")) {
      return (
        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <svg className="h-8 w-8 text-yellow-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium truncate">{filename}</p>
            <p className="text-xs text-gray-500">JSON File</p>
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
    } else if (
      contentType.includes("application/zip") ||
      contentType.includes("application/x-zip") ||
      filename.match(/\.(zip|rar|7z|tar|gz)$/i)
    ) {
      return (
        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <svg className="h-8 w-8 text-amber-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium truncate">{filename}</p>
            <p className="text-xs text-gray-500">Archive File</p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-purple-600 hover:text-purple-800 text-sm"
          >
            Download
          </a>
        </div>
      )
    } else if (contentType.includes("audio/") || filename.match(/\.(mp3|wav|ogg|flac|aac)$/i)) {
      return (
        <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-2">
            <svg className="h-8 w-8 text-purple-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium truncate">{filename}</p>
              <p className="text-xs text-gray-500">Audio File</p>
            </div>
          </div>
          <audio controls className="w-full max-w-xs">
            <source src={url} type={contentType} />
            Your browser does not support the audio element.
          </audio>
        </div>
      )
    } else if (contentType.includes("video/") || filename.match(/\.(mp4|webm|mov|avi|mkv)$/i)) {
      return (
        <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-2">
            <svg className="h-8 w-8 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium truncate">{filename}</p>
              <p className="text-xs text-gray-500">Video File</p>
            </div>
          </div>
          <div className="relative pt-[56.25%] w-full overflow-hidden rounded">
            <video className="absolute top-0 left-0 w-full h-full object-contain bg-black" controls preload="metadata">
              <source src={url} type={contentType} />
              Your browser does not support the video element.
            </video>
          </div>
        </div>
      )
    } else if (
      contentType.includes("application/javascript") ||
      contentType.includes("text/javascript") ||
      filename.match(/\.(js|ts|jsx|tsx)$/i)
    ) {
      return (
        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
          <svg className="h-8 w-8 text-yellow-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium truncate">{filename}</p>
            <p className="text-xs text-gray-500">JavaScript/TypeScript File</p>
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
            <p className="text-xs text-gray-500">{contentType || "Unknown file type"}</p>
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
