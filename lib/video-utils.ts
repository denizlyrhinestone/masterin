/**
 * Utility functions for video processing and thumbnail generation
 * Browser-compatible version
 */

/**
 * Generates thumbnail images from a video at specified timestamps
 * @param videoFile Video file to process
 * @param timestamps Array of timestamps in seconds to extract frames
 * @returns Array of object URLs to generated thumbnails
 */
export async function generateThumbnailsFromVideo(
  videoFile: File,
  timestamps: number[] = [0, 3, 6, 9, 12],
): Promise<string[]> {
  const videoUrl = URL.createObjectURL(videoFile)
  const thumbnailUrls: string[] = []

  try {
    // Create a video element to load the video
    const video = document.createElement("video")
    video.src = videoUrl
    video.crossOrigin = "anonymous"
    video.muted = true

    // Wait for video metadata to load
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve()
      video.onerror = () => reject(new Error("Failed to load video"))
      video.load()
    })

    // Generate thumbnails for each timestamp
    for (const timestamp of timestamps) {
      // Ensure timestamp is within video duration
      const safeTimestamp = Math.min(timestamp, video.duration - 0.1)

      // Seek to the timestamp
      video.currentTime = safeTimestamp

      // Wait for the frame to be loaded
      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve()
      })

      // Create a canvas to draw the video frame
      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw the video frame to the canvas
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.9)
        })

        // Create object URL for the blob
        const thumbnailUrl = URL.createObjectURL(blob)
        thumbnailUrls.push(thumbnailUrl)
      }
    }

    return thumbnailUrls
  } catch (error) {
    console.error("Error generating thumbnails:", error)
    throw error
  } finally {
    // Clean up the video URL
    URL.revokeObjectURL(videoUrl)
  }
}

/**
 * Analyzes video thumbnails to select the best one based on image quality metrics
 * @param thumbnailUrls Array of thumbnail URLs
 * @returns URL of the best thumbnail
 */
export function selectBestThumbnail(thumbnailUrls: string[]): string {
  // This is a simplified implementation
  // In a real-world scenario, you would analyze images for:
  // - Brightness and contrast
  // - Face detection
  // - Rule of thirds composition
  // - Blur detection
  // - Color variance

  // For now, we'll just return the middle thumbnail
  if (thumbnailUrls.length === 0) {
    throw new Error("No thumbnails provided")
  }

  const middleIndex = Math.floor(thumbnailUrls.length / 2)
  return thumbnailUrls[middleIndex]
}

/**
 * Gets video metadata including duration, resolution, etc.
 * @param videoFile Video file to analyze
 * @returns Promise resolving to video metadata
 */
export async function getVideoMetadata(videoFile: File): Promise<{
  duration: number
  width: number
  height: number
  format: string
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    const url = URL.createObjectURL(videoFile)

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        format: videoFile.type.split("/")[1] || "unknown",
      })
    }

    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load video metadata"))
    }

    video.src = url
  })
}
