/**
 * Video playback utility functions
 */

// Check if a video format is supported by the browser
export function isFormatSupported(format: string): boolean {
  if (typeof window === "undefined") return false

  const video = document.createElement("video")
  return video.canPlayType(format) !== ""
}

// Get supported video formats
export function getSupportedFormats(): {
  mp4: boolean
  webm: boolean
  ogg: boolean
  hls: boolean
} {
  if (typeof window === "undefined") {
    return { mp4: true, webm: true, ogg: false, hls: false }
  }

  return {
    mp4: isFormatSupported("video/mp4"),
    webm: isFormatSupported("video/webm"),
    ogg: isFormatSupported("video/ogg"),
    hls: isFormatSupported("application/vnd.apple.mpegurl") || isFormatSupported("application/x-mpegURL"),
  }
}

// Check if the browser supports the HTML5 video element
export function supportsVideoElement(): boolean {
  if (typeof window === "undefined") return true

  const video = document.createElement("video")
  return typeof video.canPlayType === "function"
}

// Get optimal video format based on browser support
export function getOptimalFormat(availableFormats: { [key: string]: string }): string | null {
  const supported = getSupportedFormats()

  // Prioritize formats based on quality and compatibility
  if (supported.webm && availableFormats.webm) return availableFormats.webm
  if (supported.mp4 && availableFormats.mp4) return availableFormats.mp4
  if (supported.ogg && availableFormats.ogg) return availableFormats.ogg

  // Return the first available format as fallback
  const formats = Object.values(availableFormats)
  return formats.length > 0 ? formats[0] : null
}

// Generate video thumbnail URLs for different timestamps
export function generateThumbnailUrls(videoId: string, count = 3): string[] {
  return Array.from({ length: count }, (_, i) => {
    const timestamp = Math.floor((i / (count - 1)) * 100)
    return `/api/video-thumbnail/${videoId}?timestamp=${timestamp}`
  })
}

// Check if the browser can autoplay videos
export async function canAutoplay(muted = false): Promise<boolean> {
  if (typeof window === "undefined") return false

  const video = document.createElement("video")
  video.muted = muted

  try {
    // Try to play the video
    await video.play()
    return true
  } catch (error) {
    return false
  } finally {
    video.remove()
  }
}

// Detect connection speed and return appropriate video quality
export async function detectOptimalQuality(): Promise<"low" | "medium" | "high"> {
  if (typeof window === "undefined" || !("connection" in navigator)) {
    return "medium"
  }

  const connection = (navigator as any).connection

  if (connection) {
    const effectiveType = connection.effectiveType

    if (effectiveType === "4g") return "high"
    if (effectiveType === "3g") return "medium"
    return "low"
  }

  // Fallback to medium quality if Network Information API is not available
  return "medium"
}

// Add these new functions at the end of the file

// Check if the browser supports WebVTT captions
export function supportsCaptions(): boolean {
  if (typeof window === "undefined") return true

  const video = document.createElement("video")
  const track = document.createElement("track")

  // If TextTrack API is available, captions are likely supported
  return typeof track.track !== "undefined"
}

// Get the default language for captions based on browser language
export function getDefaultCaptionLanguage(): string {
  if (typeof window === "undefined") return "en"

  // Get browser language (e.g., "en-US" -> "en")
  const browserLang = navigator.language.split("-")[0]
  return browserLang || "en"
}

// Generate chapter data from video metadata or timestamps
export function generateChaptersFromMetadata(
  videoId: string,
  chapterMarkers: Array<{ title: string; time: number }>,
): Array<{ id: string; title: string; startTime: number; thumbnail?: string }> {
  return chapterMarkers.map((marker, index) => ({
    id: `chapter-${index}`,
    title: marker.title,
    startTime: marker.time,
    thumbnail: `/api/video-thumbnail/${videoId}?timestamp=${marker.time}`,
  }))
}

// Extract chapters from VTT chapter file
export async function extractChaptersFromVTT(
  vttUrl: string,
): Promise<Array<{ id: string; title: string; startTime: number }>> {
  try {
    const response = await fetch(vttUrl)
    const text = await response.text()

    // Simple VTT parser for chapters
    const lines = text.split("\n")
    const chapters = []
    let currentChapter: { id?: string; title?: string; startTime?: number } = {}

    for (const line of lines) {
      // Parse timestamp line (00:00:00.000 --> 00:00:10.000)
      if (line.includes("-->")) {
        const startTime = line.split("-->")[0].trim()
        currentChapter.startTime = convertTimestampToSeconds(startTime)
      }
      // Parse chapter title (any non-empty line that's not a timestamp or WEBVTT)
      else if (line.trim() && !line.includes("WEBVTT") && !currentChapter.title) {
        currentChapter.title = line.trim()
        currentChapter.id = `chapter-${chapters.length}`

        // Save completed chapter and reset
        if (currentChapter.title && currentChapter.startTime !== undefined) {
          chapters.push({ ...currentChapter })
          currentChapter = {}
        }
      }
    }

    return chapters
  } catch (error) {
    console.error("Error parsing chapters VTT:", error)
    return []
  }
}

// Helper to convert VTT timestamp to seconds
function convertTimestampToSeconds(timestamp: string): number {
  const parts = timestamp.split(":")
  let seconds = 0

  if (parts.length === 3) {
    // Format: 00:00:00.000
    const [hours, minutes, secondsPart] = parts
    seconds = Number.parseInt(hours) * 3600 + Number.parseInt(minutes) * 60 + Number.parseFloat(secondsPart)
  } else if (parts.length === 2) {
    // Format: 00:00.000
    const [minutes, secondsPart] = parts
    seconds = Number.parseInt(minutes) * 60 + Number.parseFloat(secondsPart)
  }

  return seconds
}
