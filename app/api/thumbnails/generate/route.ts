import { type NextRequest, NextResponse } from "next/server"

// Mock API response for v0 preview
export async function POST(request: NextRequest) {
  try {
    // Check if request is multipart/form-data
    const contentType = request.headers.get("content-type") || ""
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Request must be multipart/form-data" }, { status: 400 })
    }

    // In the v0 preview, we'll return mock data
    // In a real implementation, this would process the video and generate thumbnails

    // Generate mock thumbnail paths
    const mockThumbnailPaths = [
      "/thumbnails/mock-thumbnail-1.jpg",
      "/thumbnails/mock-thumbnail-2.jpg",
      "/thumbnails/mock-thumbnail-3.jpg",
      "/thumbnails/mock-thumbnail-4.jpg",
      "/thumbnails/mock-thumbnail-5.jpg",
    ]

    // Mock best thumbnail
    const mockBestThumbnail = "/thumbnails/mock-thumbnail-3.jpg"

    return NextResponse.json({
      success: true,
      thumbnails: mockThumbnailPaths,
      bestThumbnail: mockBestThumbnail,
    })
  } catch (error) {
    console.error("Error generating thumbnails:", error)
    return NextResponse.json(
      {
        error: "Failed to generate thumbnails",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
