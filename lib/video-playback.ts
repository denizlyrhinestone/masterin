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
