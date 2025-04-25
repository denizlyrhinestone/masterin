import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: Request) {
  try {
    // Get the file from the request
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "text/plain",
      "text/csv",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    // Generate a unique ID for the file
    const fileId = uuidv4()
    const fileType = file.type.split("/")[0] || "other"

    // For simplicity, we'll just return a placeholder URL
    // In a real implementation, you would upload the file to storage
    const placeholderUrl = `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(file.name)}`

    // Return the file details
    return NextResponse.json({
      id: fileId,
      url: placeholderUrl,
      filename: file.name,
      fileType: fileType,
      contentType: file.type,
    })
  } catch (error) {
    console.error("Error handling file upload:", error)
    return NextResponse.json(
      {
        error: "An error occurred while processing your request",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    )
  }
}
