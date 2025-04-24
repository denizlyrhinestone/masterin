import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { uploadFile } from "@/lib/file-upload"

// Set maximum duration for file uploads
export const maxDuration = 60

export async function POST(req: Request) {
  try {
    // Initialize Supabase
    const supabase = createServerSupabaseClient()

    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    // Upload the file
    const uploadedFile = await uploadFile(file)

    // Return the uploaded file details
    return NextResponse.json(uploadedFile)
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      {
        error: "An error occurred while processing your request",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    )
  }
}
