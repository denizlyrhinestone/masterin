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

    setIsUploading(true); setError(null); setStatusMessage("Preparing upload..."); setUploadProgress(0);
    let initiatedFileId: string | number | null = null;

    try {
      // Step 1: Initiate Upload
      setStatusMessage('Initiating upload...');
      const initiateResponse = await apiClient.post<{
        message: string, file_id: string | number, upload_path_info: string, current_status: string
      }>('/courses/files/initiate-upload', {
        file_name: selectedFile.name,
        mime_type: selectedFile.type,
        size_bytes: selectedFile.size,
        // context: uploadContext, // Backend doesn't use context currently, but could be added
      });

      // apiClient throws for non-ok responses, so we assume success if no throw
      initiatedFileId = initiateResponse.file_id;
      // const serverRelativePath = initiateResponse.upload_path_info; // May not be needed for direct FormData post

      setStatusMessage("Uploading file...");

      // Step 2: Actual File Upload
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Using fetch directly for progress, as apiClient doesn't support it easily.
      // Alternatively, enhance apiClient or use axios if it's the base for apiClient.
      const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `/api/courses/files/upload-actual/${initiatedFileId}`, true);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      // No Content-Type header for FormData, browser sets it with boundary

      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentCompleted = Math.round((event.loaded * 100) / event.total);
            setUploadProgress(percentCompleted);
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            let errorMsg = `File upload failed: ${xhr.statusText}`;
            try { const errResp = JSON.parse(xhr.responseText); errorMsg = errResp.message || errorMsg; } catch(e){}
            reject(new Error(errorMsg));
          }
        };
        xhr.onerror = () => {
          reject(new Error('File upload failed due to network error.'));
        };
        xhr.send(formData);
      });

      setStatusMessage("Finalizing upload...");
      // Step 3: Complete Upload
      const completeResponse = await apiClient.post< { message: string, file: UploadedFileMetadata } >(
        `/courses/files/${initiatedFileId}/complete-upload`,
        { upload_status: 'completed' }
      );

      setStatusMessage("Upload successful!");
      if (onUploadSuccess) onUploadSuccess(completeResponse.file);
      setSelectedFile(null);

    } catch (err: any) {
      console.error("Upload process error:", err);
      setError(err.message || "An unknown upload error occurred.");
      setStatusMessage("Upload failed.");
      if (onUploadError) onUploadError(err.message || "An unknown upload error occurred.");

      if (initiatedFileId && !(err.message && err.message.includes('finalize'))) { // Avoid double notification if finalize failed
        try {
          await apiClient.post(`/courses/files/${initiatedFileId}/complete-upload`, { upload_status: 'error' });
          console.log("Backend notified of failed upload for file ID:", initiatedFileId);
        } catch (notificationError) {
          console.error("Failed to notify backend of upload error:", notificationError);
        }
      }
    } finally {
      setIsUploading(false);
      // Keep progress at 100 or reset based on success/failure for UX
      if (error) setUploadProgress(0); else setUploadProgress(100);
    }
  }, [selectedFile, uploadContext, onUploadSuccess, onUploadError, error]); // Added error to dependency array

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
