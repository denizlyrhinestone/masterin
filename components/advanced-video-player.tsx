"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Play, X, Volume2, VolumeX, ChevronRight } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { VideoChapters, type VideoChapter } from "./video-chapters"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AdvancedVideoPlayerProps {
  title: string
  videoUrl: string
  thumbnailUrl: string
  fallbackFormats?: {
    webm?: string
    mp4?: string
    ogg?: string
  }
  captions?: {
    src: string
    label: string
    srcLang: string
    default?: boolean
  }[]
  chapters?: VideoChapter[]
}

export default function AdvancedVideoPlayer({
  title,
  videoUrl,
  thumbnailUrl,
  fallbackFormats,
  captions,
  chapters = [],
}: AdvancedVideoPlayerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [captionsEnabled, setCaptionsEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showChapters, setShowChapters] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Memoize event handlers with useCallback to prevent recreating them on each render
  const handlePlay = useCallback(() => setIsPlaying(true), [])
  const handlePause = useCallback(() => setIsPlaying(false), [])
  const handleError = useCallback((e: Event) => {
    console.error("Video error:", e)
    setError("Failed to load video. Please try again later.")
    toast({
      title: "Video Error",
      description: "There was a problem playing this video. Please try again later.",
      variant: "destructive",
    })
  }, [])
  const handleCanPlay = useCallback(() => setIsLoading(false), [])
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }, [])
  const handleDurationChange = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }, [])

  // Handle video events
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    // Add event listeners
    videoElement.addEventListener("play", handlePlay)
    videoElement.addEventListener("pause", handlePause)
    videoElement.addEventListener("error", handleError)
    videoElement.addEventListener("canplay", handleCanPlay)
    videoElement.addEventListener("timeupdate", handleTimeUpdate)
    videoElement.addEventListener("durationchange", handleDurationChange)

    // Cleanup function - store the current videoElement reference
    // to ensure we remove listeners from the correct element
    return () => {
      videoElement.removeEventListener("play", handlePlay)
      videoElement.removeEventListener("pause", handlePause)
      videoElement.removeEventListener("error", handleError)
      videoElement.removeEventListener("canplay", handleCanPlay)
      videoElement.removeEventListener("timeupdate", handleTimeUpdate)
      videoElement.removeEventListener("durationchange", handleDurationChange)
    }
  }, [handlePlay, handlePause, handleError, handleCanPlay, handleTimeUpdate, handleDurationChange])

  // Pause video when dialog closes
  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause()
      setIsLoading(true)
      setError(null)
    }
  }, [isOpen])

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(!isMuted)
    }
  }, [isMuted])

  const toggleCaptions = useCallback(() => {
    setCaptionsEnabled((prev) => !prev)
    if (videoRef.current) {
      const tracks = videoRef.current.textTracks
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = captionsEnabled ? "hidden" : "showing"
      }
    }
  }, [captionsEnabled])

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch((err) => {
          console.error("Play error:", err)
          setError("Browser prevented autoplay. Please click play again.")
          toast({
            title: "Autoplay Blocked",
            description: "Your browser blocked autoplay. Please click play to start the video.",
            variant: "default",
          })
        })
      }
    }
  }, [isPlaying])

  const seekToTime = useCallback(
    (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time
        if (!isPlaying) {
          videoRef.current.play().catch((err) => {
            console.error("Play error when seeking:", err)
            toast({
              title: "Playback Error",
              description: "There was an error when trying to play the video. Please try again.",
              variant: "destructive",
            })
          })
        }
      }
    },
    [isPlaying],
  )

  // Format time for display (MM:SS)
  const formatDisplayTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }, [])

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
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-4">
            <DialogTitle>{title} - Course Preview</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="absolute right-4 top-4">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className="flex flex-col md:flex-row">
            <div className="md:w-2/3">
              <div className="aspect-video relative overflow-hidden bg-gray-900">
                {isLoading && !error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-10">
                    <div className="w-12 h-12 border-4 border-t-purple-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-4 z-10">
                    <p className="text-center mb-4">{error}</p>
                    <Button
                      onClick={() => {
                        setError(null)
                        if (videoRef.current) {
                          videoRef.current.load()
                          videoRef.current.play().catch((e) => console.error(e))
                        }
                      }}
                    >
                      Try Again
                    </Button>
                  </div>
                )}

                <video
                  ref={videoRef}
                  controls={!error}
                  className="w-full h-full"
                  poster={thumbnailUrl}
                  preload="metadata"
                  playsInline
                  crossOrigin="anonymous" // Add crossOrigin for CORS compliance
                >
                  {/* Primary source */}
                  <source src={videoUrl} type={videoUrl.endsWith(".mp4") ? "video/mp4" : "video/webm"} />
                  {/* Fallback sources for different formats */}
                  {fallbackFormats?.webm && <source src={fallbackFormats.webm} type="video/webm" />}
                  {fallbackFormats?.mp4 && <source src={fallbackFormats.mp4} type="video/mp4" />}
                  {fallbackFormats?.ogg && <source src={fallbackFormats.ogg} type="video/ogg" />}
                  {/* Captions */}
                  {captions &&
                    captions.map((caption, index) => (
                      <track
                        key={index}
                        src={caption.src}
                        kind="subtitles"
                        label={caption.label}
                        srcLang={caption.srcLang}
                        default={caption.default}
                      />
                    ))}
                  Your browser does not support the video tag. Please try a different browser or download the video.
                </video>

                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-20 opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? <span className="h-4 w-4">⏸️</span> : <Play className="h-4 w-4" />}
                      <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                      onClick={toggleMute}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                      onClick={toggleCaptions}
                    >
                      {captionsEnabled ? (
                        <span className="h-4 w-4">CC</span>
                      ) : (
                        <span className="h-4 w-4 opacity-50">CC</span>
                      )}
                      <span className="sr-only">{captionsEnabled ? "Disable Captions" : "Enable Captions"}</span>
                    </Button>

                    <span className="text-white text-xs bg-black bg-opacity-70 px-2 py-1 rounded">
                      {formatDisplayTime(currentTime)} / {formatDisplayTime(duration)}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-black bg-opacity-50 text-white hover:bg-opacity-70 md:hidden"
                    onClick={() => setShowChapters(!showChapters)}
                  >
                    Chapters <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

            <div className={`md:w-1/3 bg-gray-50 dark:bg-gray-800 p-4 ${showChapters ? "block" : "hidden md:block"}`}>
              <Tabs defaultValue="chapters">
                <TabsList className="w-full">
                  <TabsTrigger value="chapters">Chapters</TabsTrigger>
                  <TabsTrigger value="info">Info</TabsTrigger>
                </TabsList>

                <TabsContent value="chapters" className="mt-4">
                  {chapters.length > 0 ? (
                    <VideoChapters
                      chapters={chapters}
                      currentTime={currentTime}
                      duration={duration}
                      onChapterClick={seekToTime}
                    />
                  ) : (
                    <p className="text-sm text-gray-500">No chapters available for this video.</p>
                  )}
                </TabsContent>

                <TabsContent value="info" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">About this video</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        This preview gives you a glimpse into the course content. The full course includes comprehensive
                        lessons, exercises, and resources.
                      </p>
                    </div>

                    {captions && captions.length > 0 && (
                      <div>
                        <h3 className="font-medium">Available captions</h3>
                        <ul className="mt-1">
                          {captions.map((caption, index) => (
                            <li key={index} className="text-sm">
                              {caption.label} {caption.default && "(Default)"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="p-4 text-sm text-gray-500">
            This is a preview of the course content. Enroll to access the full curriculum.
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
