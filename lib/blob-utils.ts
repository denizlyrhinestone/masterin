import { put } from "@vercel/blob"
import { nanoid } from "nanoid"

export async function uploadDocumentToBlob(file: File, userId: string): Promise<string> {
  try {
    // Generate a unique filename with user ID prefix for organization
    const filename = `educator-verification/${userId}/${nanoid()}-${file.name}`

    // Upload to Vercel Blob
    const { url } = await put(filename, file, {
      access: "private", // Only accessible via authenticated requests
      contentType: file.type,
      multipart: true,
    })

    return url
  } catch (error) {
    console.error("Error uploading document to Blob:", error)
    throw new Error("Failed to upload document. Please try again.")
  }
}

export function getFileNameFromUrl(url: string): string {
  try {
    // Extract filename from URL
    const urlParts = url.split("/")
    const filenameWithParams = urlParts[urlParts.length - 1]
    // Remove any query parameters
    const filename = filenameWithParams.split("?")[0]

    // Extract the original filename from our naming pattern
    const originalFilename = filename.split("-").slice(1).join("-")

    return decodeURIComponent(originalFilename)
  } catch (error) {
    return "Document"
  }
}
