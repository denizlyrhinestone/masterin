import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Return static sample thumbnail data
    return NextResponse.json({
      thumbnail: {
        url: "/video-still-12-seconds.png",
        width: 1280,
        height: 720,
      },
    })
  } catch (error) {
    console.error("Error fetching thumbnail:", error)
    return NextResponse.json({ error: "Failed to fetch thumbnail" }, { status: 500 })
  }
}
