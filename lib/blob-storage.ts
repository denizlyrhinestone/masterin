import { put, del, list, head } from "@vercel/blob"

// Upload a file to Blob storage
export async function uploadFile(
  file: File,
  options?: {
    folder?: string
    access?: "public" | "private"
  },
): Promise<{ url: string; success: boolean }> {
  try {
    const folder = options?.folder || "uploads"
    const access = options?.access || "public"

    // Create a path with folder structure
    const path = `${folder}/${Date.now()}-${file.name}`

    // Upload to Vercel Blob
    const { url } = await put(path, file, { access })

    return { url, success: true }
  } catch (error) {
    console.error("Failed to upload file to Blob storage:", error)
    return { url: "", success: false }
  }
}

// Delete a file from Blob storage
export async function deleteFile(url: string): Promise<boolean> {
  try {
    await del(url)
    return true
  } catch (error) {
    console.error("Failed to delete file from Blob storage:", error)
    return false
  }
}

// List files in a folder
export async function listFiles(prefix: string): Promise<{ url: string; pathname: string; size: number }[]> {
  try {
    const { blobs } = await list({ prefix })
    return blobs.map((blob) => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
    }))
  } catch (error) {
    console.error("Failed to list files from Blob storage:", error)
    return []
  }
}

// Check if a file exists
export async function fileExists(url: string): Promise<boolean> {
  try {
    const result = await head(url)
    return !!result
  } catch (error) {
    return false
  }
}
