import { put } from "@vercel/blob"
import { createId } from "@paralleldrive/cuid2"
import { supabase } from "@/lib/supabase"

// Supported file types
export const ALLOWED_FILE_TYPES = {
  // Images
  "image/jpeg": { type: "image", extension: "jpg" },
  "image/png": { type: "image", extension: "png" },
  "image/gif": { type: "image", extension: "gif" },
  "image/webp": { type: "image", extension: "webp" },

  // Documents
  "application/pdf": { type: "document", extension: "pdf" },
  "text/plain": { type: "document", extension: "txt" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { type: "document", extension: "docx" },
  "application/msword": { type: "document", extension: "doc" },

  // Spreadsheets
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { type: "spreadsheet", extension: "xlsx" },
  "application/vnd.ms-excel": { type: "spreadsheet", extension: "xls" },

  // Code files
  "text/javascript": { type: "code", extension: "js" },
  "text/x-python": { type: "code", extension: "py" },
  "text/x-java": { type: "code", extension: "java" },
  "text/html": { type: "code", extension: "html" },
  "text/css": { type: "code", extension: "css" },
}

export type FileType = "image" | "document" | "spreadsheet" | "code"

export interface UploadedFile {
  id: string
  url: string
  filename: string
  contentType: string
  fileType: FileType
  size: number
  uploadedAt: string
}

// Maximum file size (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024

/**
 * Uploads a file to Vercel Blob storage
 */
export async function uploadFile(file: File, userId?: string): Promise<UploadedFile | null> {
  try {
    // Validate file type
    if (!ALLOWED_FILE_TYPES[file.type]) {
      throw new Error(`Unsupported file type: ${file.type}`)
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
    }

    // Generate a unique filename
    const fileId = createId()
    const fileInfo = ALLOWED_FILE_TYPES[file.type]
    const extension = fileInfo.extension
    const filename = `${fileId}.${extension}`

    // Create a folder structure based on user and file type
    const folder = userId ? `users/${userId}/${fileInfo.type}` : `anonymous/${fileInfo.type}`
    const path = `${folder}/${filename}`

    // Upload to Vercel Blob
    const blob = await put(path, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    })

    // Return file information
    return {
      id: fileId,
      url: blob.url,
      filename: file.name,
      contentType: file.type,
      fileType: fileInfo.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    return null
  }
}

/**
 * Stores attachment metadata in the database
 */
export async function storeAttachmentMetadata(userId: string, messageId: string, file: UploadedFile): Promise<boolean> {
  try {
    // First store in user_files table
    const { error: userFileError } = await supabase.from("user_files").insert({
      user_id: userId,
      file_id: file.id,
      filename: file.filename,
      file_url: file.url,
      file_type: file.fileType,
      content_type: file.contentType,
      size: file.size,
    })

    if (userFileError) {
      console.error("Error storing user file:", userFileError)
      return false
    }

    // Then store in message_attachments table
    const { error: attachmentError } = await supabase.from("message_attachments").insert({
      message_id: messageId,
      file_id: file.id,
      file_url: file.url,
      file_type: file.fileType,
      filename: file.filename,
      content_type: file.contentType,
    })

    if (attachmentError) {
      console.error("Error storing message attachment:", attachmentError)
      return false
    }

    return true
  } catch (error) {
    console.error("Error storing attachment metadata:", error)
    return false
  }
}

/**
 * Validates if a file can be uploaded
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_FILE_TYPES[file.type]) {
    return {
      valid: false,
      error: `Unsupported file type. Allowed types: ${Object.keys(ALLOWED_FILE_TYPES)
        .map((type) => type.split("/")[1])
        .join(", ")}`,
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    }
  }

  return { valid: true }
}
