"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface VideoChapter {
  id: string
  title: string
  startTime: number // in seconds
  endTime?: number // in seconds
  thumbnail?: string
}

interface VideoChaptersProps {
  chapters: VideoChapter[]
  currentTime: number
  duration: number
  onChapterClick: (time: number) => void
}

export function VideoChapters({ chapters, currentTime, duration, onChapterClick }: VideoChaptersProps) {
  const [activeChapter, setActiveChapter] = useState<VideoChapter | null>(null)

  // Find the current active chapter based on video currentTime
  useEffect(() => {
    const current = chapters.find((chapter, index) => {
      const nextChapter = chapters[index + 1]
      const chapterEndTime = chapter.endTime || (nextChapter ? nextChapter.startTime : duration)
      return currentTime >= chapter.startTime && currentTime < chapterEndTime
    })

    if (current && (!activeChapter || current.id !== activeChapter.id)) {
      setActiveChapter(current)
    }
  }, [chapters, currentTime, duration, activeChapter])

  // Calculate progress percentage for the timeline
  const getChapterPosition = (startTime: number) => {
    return (startTime / duration) * 100
  }

  // Calculate width percentage for each chapter
  const getChapterWidth = (startTime: number, endTime: number) => {
    return ((endTime - startTime) / duration) * 100
  }

  return (
    <div className="w-full space-y-2">
      {/* Chapter timeline visualization */}
      <div className="relative h-1.5 bg-gray-200 rounded-full w-full">
        {chapters.map((chapter, index) => {
          const nextChapter = chapters[index + 1]
          const endTime = chapter.endTime || (nextChapter ? nextChapter.startTime : duration)

          return (
            <div
              key={chapter.id}
              className={`absolute h-full rounded-full ${
                activeChapter?.id === chapter.id ? "bg-purple-600" : "bg-gray-400"
              }`}
              style={{
                left: `${getChapterPosition(chapter.startTime)}%`,
                width: `${getChapterWidth(chapter.startTime, endTime)}%`,
              }}
              title={chapter.title}
            />
          )
        })}

        {/* Current position indicator */}
        <div
          className="absolute h-3 w-3 bg-purple-600 rounded-full -top-0.75 transform -translate-y-1/4"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        />
      </div>

      {/* Chapter list */}
      <ScrollArea className="h-40 rounded-md border">
        <div className="p-2 space-y-1">
          {chapters.map((chapter) => (
            <Button
              key={chapter.id}
              variant="ghost"
              size="sm"
              className={`w-full justify-start text-left ${
                activeChapter?.id === chapter.id ? "bg-purple-100 text-purple-900" : ""
              }`}
              onClick={() => onChapterClick(chapter.startTime)}
            >
              <div className="flex items-center space-x-2">
                {chapter.thumbnail && (
                  <div className="w-8 h-8 overflow-hidden rounded">
                    <img src={chapter.thumbnail || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <div className="font-medium">{chapter.title}</div>
                  <div className="text-xs text-gray-500">{formatTime(chapter.startTime)}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

// Helper function to format time in MM:SS format
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}
