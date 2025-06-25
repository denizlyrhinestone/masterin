import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FileUploadComponent, { UploadedFileMetadata } from './FileUploadComponent';
import apiClient from '@/lib/apiClient';

// Mock apiClient
jest.mock('@/lib/apiClient');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Mock XMLHttpRequest for the S3 PUT part
const mockXHR = {
  open: jest.fn(),
  setRequestHeader: jest.fn(),
  upload: { onprogress: jest.fn() } as any, // 'as any' to simplify complex type
  onload: jest.fn() as (() => void) | null, // Ensure it can be null or function
  onerror: jest.fn() as (() => void) | null,
  send: jest.fn(function(this: any) { // Use function keyword for 'this' context
    // Simulate successful S3 upload by default
    this.status = 200;
    this.statusText = 'OK';
    if (this.onload) {
      this.onload();
    }
  }),
  status: 200, // Default success status
  statusText: 'OK',
  responseText: '', // Default empty response
};
global.XMLHttpRequest = jest.fn(() => mockXHR) as any;


describe('FileUploadComponent', () => {
  const mockOnUploadSuccess = jest.fn();
  const mockOnUploadError = jest.fn();
  const defaultProps = {
    onUploadSuccess: mockOnUploadSuccess,
    onUploadError: mockOnUploadError,
    uploadContext: 'test_context',
    allowedFileTypes: ['image/png', 'image/jpeg'],
    maxFileSizeMB: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset XHR mock parts that might change per test
    mockXHR.status = 200;
    mockXHR.statusText = 'OK';
    mockXHR.responseText = '';
    // Ensure onload and onerror can be reassigned by specific tests if needed
    // by resetting them or by having specific tests re-trigger send() on a new XHR mock instance.
    // For simplicity, the global mock's send will trigger its onload.
    // If a test needs XHR to fail, it can modify mockXHR.status before upload.
  });

  it('renders initial state correctly', () => {
    render(<FileUploadComponent {...defaultProps} />);
    expect(screen.getByLabelText(/Select File/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Upload/i })).not.toBeInTheDocument(); // No button if no file
  });

  it('allows file selection and displays file info', async () => {
    render(<FileUploadComponent {...defaultProps} />);
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Select File/i) as HTMLInputElement;

    await userEvent.upload(input, file);

    expect(screen.getByText('chucknorris.png (0.0 KB)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload chucknorris.png/i })).toBeInTheDocument();
  });

  it('validates file type', async () => {
    render(<FileUploadComponent {...defaultProps} />);
    const file = new File(['(⌐□_□)'], 'chucknorris.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/Select File/i) as HTMLInputElement;

    await userEvent.upload(input, file);

    expect(screen.getByText(/Invalid file type/i)).toBeInTheDocument();
    expect(mockOnUploadError).not.toHaveBeenCalled(); // This is a client-side validation error
  });

  it('validates file size', async () => {
    render(<FileUploadComponent {...defaultProps} maxFileSizeMB={0.001} />); // 1KB limit
    const file = new File(['(⌐□_□)'.repeat(100)], 'largefile.png', { type: 'image/png' }); // > 1KB
    const input = screen.getByLabelText(/Select File/i) as HTMLInputElement;

    await userEvent.upload(input, file);

    expect(screen.getByText(/File is too large/i)).toBeInTheDocument();
  });

  it('handles successful upload flow', async () => {
    const mockInitiateResponse = {
      success: true,
      fileId: 'test-file-id-123',
      preSignedUploadUrl: 'https://s3.example.com/upload-here',
      s3Key: 'uploads/test_context/user_1/test-file.png',
    };
    const mockCompleteResponse = {
      success: true,
      file: { id: 'test-file-id-123', file_name: 'chucknorris.png', file_path: 's3key', mime_type: 'image/png' } as UploadedFileMetadata,
    };

    mockedApiClient.post
      .mockResolvedValueOnce(mockInitiateResponse) // For initiate-upload
      .mockResolvedValueOnce(mockCompleteResponse); // For complete-upload

    render(<FileUploadComponent {...defaultProps} />);
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Select File/i) as HTMLInputElement;
    await userEvent.upload(input, file);

    const uploadButton = screen.getByRole('button', { name: /Upload chucknorris.png/i });
    fireEvent.click(uploadButton);

    expect(mockedApiClient.post).toHaveBeenCalledWith('/courses/files/initiate-upload', expect.any(Object));

    // Wait for XHR and subsequent complete call
    await waitFor(() => {
      expect(mockXHR.send).toHaveBeenCalledTimes(1); // S3 PUT
    });
    await waitFor(() => {
      expect(mockedApiClient.post).toHaveBeenCalledWith(
        `/courses/files/${mockInitiateResponse.fileId}/complete-upload`,
        expect.objectContaining({ upload_status: 'completed' })
      );
    });
    await waitFor(() => {
      expect(mockOnUploadSuccess).toHaveBeenCalledWith(mockCompleteResponse.file);
    });
    expect(screen.getByText('Upload successful!')).toBeInTheDocument();
  });

  it('handles failure during initiate-upload', async () => {
    mockedApiClient.post.mockRejectedValueOnce(new Error('Initiate failed'));

    render(<FileUploadComponent {...defaultProps} />);
    const file = new File(['(⌐□_□)'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Select File/i) as HTMLInputElement;
    await userEvent.upload(input, file);

    fireEvent.click(screen.getByRole('button', { name: /Upload test.png/i }));

    await waitFor(() => {
      expect(mockOnUploadError).toHaveBeenCalledWith('Initiate failed');
    });
    expect(screen.getByText(/Error: Initiate failed/i)).toBeInTheDocument();
  });

  it('handles S3 PUT failure', async () => {
    const mockInitiateResponse = {
      success: true,
      fileId: 's3-fail-id-456',
      preSignedUploadUrl: 'https://s3.example.com/upload-fail',
      s3Key: 'uploads/test_context/user_1/s3-fail.png',
    };
    mockedApiClient.post.mockResolvedValueOnce(mockInitiateResponse); // Initiate success

    // Mock XHR to fail
    mockXHR.send = jest.fn(function(this: any) {
      this.status = 500;
      this.statusText = 'S3 Internal Server Error';
      if (this.onload) this.onload(); // Simulate error by calling onload with error status
    });
    // Also mock complete-upload for the error notification part
    mockedApiClient.post.mockResolvedValueOnce({ success: true }); // for the error notification call to complete-upload

    render(<FileUploadComponent {...defaultProps} />);
    const file = new File(['(⌐□_□)'], 's3-fail.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Select File/i) as HTMLInputElement;
    await userEvent.upload(input, file);
    fireEvent.click(screen.getByRole('button', { name: /Upload s3-fail.png/i }));

    await waitFor(() => {
      expect(mockOnUploadError).toHaveBeenCalledWith('S3 Upload Failed: 500 S3 Internal Server Error');
    });
    expect(screen.getByText(/S3 Upload Failed: 500 S3 Internal Server Error/i)).toBeInTheDocument();
    // Check if complete-upload was called with status 'error'
    expect(mockedApiClient.post).toHaveBeenCalledWith(
        `/courses/files/${mockInitiateResponse.fileId}/complete-upload`,
        expect.objectContaining({ upload_status: 'error' })
    );
  });

  it('handles failure during complete-upload', async () => {
    const mockInitiateResponse = {
      success: true,
      fileId: 'complete-fail-id-789',
      preSignedUploadUrl: 'https://s3.example.com/upload-ok',
      s3Key: 'uploads/test_context/user_1/complete-fail.png',
    };
    mockedApiClient.post
      .mockResolvedValueOnce(mockInitiateResponse) // Initiate success
      .mockRejectedValueOnce(new Error('Finalize failed')); // Complete-upload fails

    // Ensure XHR send is back to default success for this test
    mockXHR.send = jest.fn(function(this: any) {
        this.status = 200;
        this.statusText = 'OK';
        if (this.onload) this.onload();
    });

    render(<FileUploadComponent {...defaultProps} />);
    const file = new File(['(⌐□_□)'], 'complete-fail.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Select File/i) as HTMLInputElement;
    await userEvent.upload(input, file);
    fireEvent.click(screen.getByRole('button', { name: /Upload complete-fail.png/i }));

    await waitFor(() => {
      expect(mockOnUploadError).toHaveBeenCalledWith('Finalize failed');
    });
    expect(screen.getByText(/Error: Finalize failed/i)).toBeInTheDocument();
  });
});
