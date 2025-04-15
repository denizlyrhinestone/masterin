import { NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: Request) {
  try {
    const { filename, contentType, folder = "uploads" } = await request.json()

    if (!filename || !contentType) {
      return NextResponse.json({ error: "Missing filename or contentType" }, { status: 400 })
    }

    // Create a unique path for the file
    const path = `${folder}/${Date.now()}-${filename}`

    // Create a presigned URL for uploading
    const { url, uploadUrl } = await put(path, {
      access: "public",
      contentType,
      multipart: true,
    })

    return NextResponse.json({ url, uploadUrl })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 })
  }
}
