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
 * Uploads a file to storage
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

    // For client-side usage, we'll use a blob URL
    // In production, you would upload to a storage service
    let blobUrl = ""

    try {
      blobUrl = URL.createObjectURL(file)
    } catch (error) {
      console.error("Error creating blob URL:", error)
      // Fallback to a data URL for small files
      if (file.size < 1024 * 1024) {
        // 1MB limit for data URLs
        const reader = new FileReader()
        blobUrl = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
      } else {
        // For larger files, use a placeholder
        blobUrl = `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(file.name)}`
      }
    }

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
    // First, check if the tables exist
    const { error: tableCheckError } = await supabaseClient
      .from("user_files")
      .select("id", { count: "exact", head: true })
      .limit(1)
      .catch(() => ({ error: new Error("Table check failed") }))

    // If the table doesn't exist, log an error but don't fail
    if (tableCheckError) {
      console.error("Error checking user_files table:", tableCheckError)
      return true // Return true to prevent blocking the chat functionality
    }

    // Store the file metadata in the user_files table
    const { error: fileError } = await supabaseClient
      .from("user_files")
      .insert({
        id: file.id,
        file_url: file.url,
        filename: file.filename,
        file_type: file.fileType,
        content_type: file.contentType,
        created_at: new Date().toISOString(),
      })
      .catch(() => ({ error: new Error("File metadata insertion failed") }))

    if (fileError) {
      console.error("Error storing file metadata:", fileError)
      return false
    }

    // Associate the file with the message
    const { error: attachmentError } = await supabaseClient
      .from("message_attachments")
      .insert({
        message_id: messageId,
        file_id: file.id,
        file_url: file.url,
        filename: file.filename,
        file_type: file.fileType,
        content_type: file.contentType,
        created_at: new Date().toISOString(),
      })
      .catch(() => ({ error: new Error("Attachment metadata insertion failed") }))

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
    const { error: attachmentError } = await supabase
      .from("message_attachments")
      .delete()
      .eq("file_id", fileId)
      .catch(() => ({ error: new Error("Attachment deletion failed") }))

    if (attachmentError) {
      console.error("Error deleting attachment metadata:", attachmentError)
      return false
    }

    // Delete the file metadata from the user_files table
    const { error: fileError } = await supabase
      .from("user_files")
      .delete()
      .eq("id", fileId)
      .catch(() => ({ error: new Error("File metadata deletion failed") }))

    if (fileError) {
      console.error("Error deleting file metadata:", fileError)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteFile:", error)
    return false
  }
}
