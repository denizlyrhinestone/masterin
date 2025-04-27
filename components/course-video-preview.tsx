"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Play, X } from "lucide-react"

interface CourseVideoPreviewProps {
  title: string
  videoUrl: string
  thumbnailUrl: string
}

export default function CourseVideoPreview({ title, videoUrl, thumbnailUrl }: CourseVideoPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Pause video when dialog closes
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause()
    }
  }, [isOpen])

  return (
    <>
      <div
        className="absolute inset-0 flex items-center justify-center cursor-pointer group"
        onClick={() => setIsOpen(true)}
        aria-label={`Watch preview for ${title}`}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all duration-300"></div>
        <div className="relative z-10 bg-white dark:bg-gray-800 rounded-full p-3 transform transition-transform duration-300 group-hover:scale-110">
          <Play className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="currentColor" />
        </div>
        <span className="absolute bottom-4 left-4 right-4 text-white font-medium text-sm bg-black bg-opacity-60 px-3 py-1 rounded">
          Watch Preview
        </span>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{title} - Course Preview</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="absolute right-4 top-4">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </DialogHeader>
          <div className="aspect-video relative overflow-hidden rounded-md">
            <video ref={videoRef} controls autoPlay className="w-full h-full" poster={thumbnailUrl}>
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            This is a preview of the course content. Enroll to access the full curriculum.
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
