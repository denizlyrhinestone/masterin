import { v4 as uuidv4 } from "uuid"
import { supabase } from "./supabase"

export type UploadedFile = {
  id: string
  url: string
  filename: string
  fileType: string
  contentType: string
}

type FileValidationResult = {
  valid: boolean
  error?: string
}

/**
 * Validates a file for upload
 * @param file The file to validate
 * @returns Validation result with status and optional error message
 */
export function validateFile(file: File): FileValidationResult {
  const maxSize = 10 * 1024 * 1024 // 10MB
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

  if (file.size > maxSize) {
    return { valid: false, error: "File size exceeds 10MB" }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Unsupported file type" }
  }

  return { valid: true }
}

/**
 * Uploads a file to Vercel Blob storage
 * @param file The file to upload
 * @returns The uploaded file information
 */
export async function uploadFile(file: File): Promise<UploadedFile> {
  // Validate the file
  const validation = validateFile(file)
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid file")
  }

  try {
    // Generate a unique ID for the file
    const fileId = uuidv4()

    // Create a folder structure based on file type
    const fileType = file.type.split("/")[0] || "other"
    const timestamp = new Date().toISOString().split("T")[0]

    // Create a FormData object to upload the file
    const formData = new FormData()
    formData.append("file", file)

    // In a real implementation, this would use Vercel Blob storage
    // For now, we'll simulate the upload and return a placeholder URL
    // This is a simplified version - in production, you would use proper blob storage

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Create a blob URL for the file (in production, this would be a real URL)
    const blobUrl = URL.createObjectURL(file)

    return {
      id: fileId,
      url: blobUrl,
      filename: file.name,
      fileType: fileType,
      contentType: file.type,
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    throw new Error("Failed to upload file")
  }
}

/**
 * Stores file metadata in the database
 * @param messageId The ID of the message the file is attached to
 * @param file The file metadata
 * @param supabaseClient Optional Supabase client
 * @returns Success status
 */
export async function storeAttachmentMetadata(
  messageId: string,
  file: UploadedFile,
  supabaseClient = supabase,
): Promise<boolean> {
  try {
    // First, store the file metadata in the user_files table
    const { error: fileError } = await supabaseClient.from("user_files").insert({
      id: file.id,
      file_url: file.url,
      filename: file.filename,
      file_type: file.fileType,
      content_type: file.contentType,
      created_at: new Date().toISOString(),
    })

    if (fileError) {
      console.error("Error storing file metadata:", fileError)
      return false
    }

    // Then, associate the file with the message
    const { error: attachmentError } = await supabaseClient.from("message_attachments").insert({
      message_id: messageId,
      file_id: file.id,
      file_url: file.url,
      filename: file.filename,
      file_type: file.fileType,
      content_type: file.contentType,
      created_at: new Date().toISOString(),
    })

    if (attachmentError) {
      console.error("Error storing attachment metadata:", attachmentError)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in storeAttachmentMetadata:", error)
    return false
  }
}

/**
 * Deletes a file and its metadata
 * @param fileId The ID of the file to delete
 * @returns Success status
 */
export async function deleteFile(fileId: string): Promise<boolean> {
  try {
    // Delete the file metadata from the database
    const { error: attachmentError } = await supabase.from("message_attachments").delete().eq("file_id", fileId)

    if (attachmentError) {
      console.error("Error deleting attachment metadata:", attachmentError)
      return false
    }

    // Delete the file metadata from the user_files table
    const { error: fileError } = await supabase.from("user_files").delete().eq("id", fileId)

    if (fileError) {
      console.error("Error deleting file metadata:", fileError)
      return false
    }

    // In a real implementation, you would also delete the file from blob storage
    // For example: await deleteBlob(fileUrl)

    return true
  } catch (error) {
    console.error("Error in deleteFile:", error)
    return false
  }
}
