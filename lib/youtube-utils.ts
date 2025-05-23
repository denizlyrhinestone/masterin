export interface VideoMetadata {
  videoId: string
  title: string
  description: string
  channelTitle: string
  publishedAt: string
  thumbnails: {
    default: { url: string; width: number; height: number }
    medium: { url: string; width: number; height: number }
    high: { url: string; width: number; height: number }
  }
  duration: number
  viewCount: number
  likeCount: number
  commentCount: number
  tags: string[]
}

export interface TranscriptItem {
  text: string
  start: number
  duration: number
}

// Utility function to format duration in seconds to MM:SS format
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

// Utility function to format view count with K, M, B suffixes
export function formatViewCount(count: number): string {
  if (count >= 1000000000) {
    return (count / 1000000000).toFixed(1) + "B"
  }
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + "M"
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + "K"
  }
  return count.toString()
}
