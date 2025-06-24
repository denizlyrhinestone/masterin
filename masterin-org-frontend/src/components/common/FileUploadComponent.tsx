"use client";

import React, { useState, useCallback, ChangeEvent } from 'react';
import { ArrowUpTrayIcon, DocumentIcon, XCircleIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import apiClient from '@/lib/apiClient'; // Import the API client

export interface UploadedFileMetadata { // Exporting for use in other components
  id: string | number;
  file_name: string;
  file_path: string;
  mime_type: string;
  size_bytes?: number;
  // Add any other relevant fields returned by your backend's `complete-upload`
  // e.g. from the `uploaded_files` table: `upload_status`, `storage_details`
  upload_status?: string;
  storage_details?: any;
}

interface FileUploadComponentProps {
  onUploadSuccess: (uploadedFileMetadata: UploadedFileMetadata) => void;
  onUploadError: (errorMessage: string) => void;
  allowedFileTypes?: string[];
  maxFileSizeMB?: number;
  uploadContext: string;
}

const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
  onUploadSuccess,
  onUploadError,
  allowedFileTypes,
  maxFileSizeMB,
  uploadContext,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null); setStatusMessage(null); setSelectedFile(null); setUploadProgress(0);
    const file = event.target.files?.[0];
    if (file) {
      if (allowedFileTypes && !allowedFileTypes.includes(file.type)) {
        setError(`Invalid file type. Allowed: ${allowedFileTypes.join(', ')}`);
        return;
      }
      if (maxFileSizeMB && file.size > maxFileSizeMB * 1024 * 1024) {
        setError(`File is too large. Max size: ${maxFileSizeMB}MB`);
        return;
      }
      setSelectedFile(file);
    }
    event.target.value = '';
  };

  const handleUpload = useCallback(async () => {
    if (!selectedFile) { setError("No file selected."); return; }

    if (!selectedFile) { setError("No file selected."); return; }

    setIsUploading(true);
    setError(null);
    setStatusMessage("Preparing upload...");
    setUploadProgress(0);

    let fileIdForCompletion: string | number | null = null;
    // Store s3Key in case needed for error reporting on complete-upload
    let s3KeyForErrorNotification: string | undefined = undefined;

    try {
      // Step 1: Initiate Upload to MasterIn backend to get pre-signed URL
      setStatusMessage('Initiating secure upload session...');
      const initiatePayload = {
        file_name: selectedFile.name,
        mime_type: selectedFile.type,
        size_bytes: selectedFile.size,
        context: uploadContext,
      };
      // Assuming initiateResponse.data contains fileId, preSignedUploadUrl, s3Key
      const initiateResponse = await apiClient.post<{
        success: boolean,
        fileId: string | number,
        preSignedUploadUrl: string,
        s3Key: string,
        message?: string
      }>('/courses/files/initiate-upload', initiatePayload);

      if (!initiateResponse.success || !initiateResponse.preSignedUploadUrl || !initiateResponse.fileId) {
        throw new Error(initiateResponse.message || 'Failed to initiate secure upload session.');
      }

      const { preSignedUploadUrl, fileId, s3Key } = initiateResponse;
      fileIdForCompletion = fileId; // Store for Step 3
      s3KeyForErrorNotification = s3Key;


      // Step 2: Actual File Upload (Directly to S3 via pre-signed URL)
      setStatusMessage('Uploading to secure storage...');
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', preSignedUploadUrl, true);
        xhr.setRequestHeader('Content-Type', selectedFile.type);
        // DO NOT set 'Authorization' header for S3 pre-signed PUT URLs.
        // Authentication is handled by the pre-signed URL's query parameters.

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentCompleted = Math.round((event.loaded * 100) / event.total);
            setUploadProgress(percentCompleted);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) { // S3 PUT success is typically 200 OK
            resolve();
          } else {
            // Try to get error message from S3 response (often XML)
            let s3ErrorMessage = `S3 Upload Failed: ${xhr.status} ${xhr.statusText || 'Unknown S3 error'}`;
            if (xhr.responseText) {
                // Simple parsing attempt for XML error (very basic)
                const match = xhr.responseText.match(/<Message>(.*?)<\/Message>/i);
                if (match && match[1]) {
                    s3ErrorMessage = `S3 Upload Error: ${match[1]}`;
                }
            }
            reject(new Error(s3ErrorMessage));
          }
        };

        xhr.onerror = () => {
          reject(new Error('S3 Upload Failed: Network error or CORS issue. Check S3 bucket CORS configuration.'));
        };

        xhr.send(selectedFile); // Send the actual file object
      });

      // Step 3: Complete Upload (Notify MasterIn backend)
      setStatusMessage('Finalizing upload...');
      setUploadProgress(100); // Visually show 100% before final confirmation

      const completePayload = {
        upload_status: 'completed',
        size_bytes: selectedFile.size, // Send actual size and type for backend verification
        mime_type: selectedFile.type,
        s3_key: s3Key // Send s3Key for backend to potentially verify against its record
      };
      const completeResponse = await apiClient.post<{ success: boolean, file: UploadedFileMetadata, message?: string }>(
        `/courses/files/${fileId}/complete-upload`,
        completePayload
      );

      if (!completeResponse.success || !completeResponse.file) {
         throw new Error(completeResponse.message || 'Failed to finalize upload with server.');
      }

      setStatusMessage('Upload successful!');
      if (onUploadSuccess) onUploadSuccess(completeResponse.file); // Pass final file metadata from our backend
      setSelectedFile(null); // Clear selection on success
      setUploadProgress(0); // Reset progress for next upload

    } catch (err: any) {
      console.error("Upload process error:", err.message);
      setError(err.message || 'File upload process failed.');
      setStatusMessage("Upload failed.");
      if (onUploadError) onUploadError(err.message || 'File upload process failed.');

      // If initiate was successful but S3 upload or completion failed, notify backend to mark as 'error'
      if (fileIdForCompletion && (err.message.includes('S3 Upload Failed') || err.message.includes('Failed to finalize'))) {
        try {
          await apiClient.post(`/courses/files/${fileIdForCompletion}/complete-upload`, {
            upload_status: 'error',
            s3_key: s3KeyForErrorNotification // Send s3Key if available
          });
          console.log("Backend notified of failed upload for file ID:", fileIdForCompletion);
        } catch (notificationError: any) {
          console.error("Failed to notify backend of upload error:", notificationError.message);
        }
      }
    } finally {
      setIsUploading(false);
      // Reset progress if there was an error and not successful
      if (statusMessage !== "Upload successful!") {
        setUploadProgress(0);
      }
    }
  }, [selectedFile, uploadContext, onUploadSuccess, onUploadError]); // Removed 'error' from dep array to avoid re-triggering on error set

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-white shadow-sm w-full">
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={`file-upload-input-${uploadContext}`}>
          Select File ({uploadContext})
        </label>
        <input
          id={`file-upload-input-${uploadContext}`}
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
          disabled={isUploading}
        />
      </div>

      {selectedFile && !isUploading && (
        <div className="text-sm text-gray-700 mb-3 p-2 bg-gray-50 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <DocumentIcon className="h-5 w-5 text-gray-500 mr-2" />
            <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="p-1 text-red-500 hover:text-red-700 rounded-full focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
            aria-label="Clear selected file"
          >
            <XCircleIcon className="h-5 w-5"/>
          </button>
        </div>
      )}

      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={isUploading || !!error && !selectedFile} // Disable if error unless a new file is selected
          className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md inline-flex items-center justify-center transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
        >
          <ArrowUpTrayIcon className={`h-5 w-5 mr-2 ${isUploading ? 'animate-spin' : ''}`} />
          {isUploading ? `Uploading (${uploadProgress}%)` : `Upload ${selectedFile.name}`}
        </button>
      )}

      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-150 ease-linear" // Use linear for smoother progress
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {statusMessage && !error && (
        <div className={`mt-3 text-sm p-2 rounded-md flex items-center ${
            statusMessage === "Upload successful!" ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
        }`}>
            {statusMessage === "Upload successful!" && <CheckCircleIcon className="h-5 w-5 mr-2"/>}
            {statusMessage}
        </div>
      )}

      {error && (
        <div className="mt-3 text-sm text-red-700 p-2 bg-red-50 rounded-md flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2"/>
            Error: {error}
        </div>
      )}
    </div>
  );
};

export default FileUploadComponent;
