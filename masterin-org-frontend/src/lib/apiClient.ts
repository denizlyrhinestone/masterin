// src/lib/apiClient.ts
import { getAuthToken } from './auth';

const BASE_URL = '/api'; // Adjust if your backend API is hosted elsewhere or has a different prefix

interface RequestOptions extends RequestInit {
  // You can add custom options here if needed
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && options.body !== null && options.body !== undefined) {
    // Don't set Content-Type if body is FormData, browser does it with boundary
    // Also ensure options.body is not null or undefined before trying to set Content-Type
     if (!headers.has('Content-Type')) { // Only set if not already set (e.g. for FormData)
        headers.append('Content-Type', 'application/json');
     }
  }


  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.error || JSON.stringify(errorBody.errors) || errorMessage;
    } catch (e) {
      // Could not parse error body as JSON
      const textError = await response.text();
      if (textError) {
        errorMessage = textError;
      }
    }
    throw new Error(errorMessage);
  }

  // Handle cases where response might be empty (e.g., 204 No Content)
  const contentType = response.headers.get('content-type');
  if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
    return {} as T; // Or handle as Promise<void> or Promise<Response> if preferred
  }

  return response.json() as Promise<T>;
}

const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: any, options?: RequestOptions) => {
    const isFormData = body instanceof FormData;
    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body)
      // For FormData, Content-Type header is set by browser, so don't set it to application/json
    });
  },
  put: <T>(endpoint: string, body: any, options?: RequestOptions) => {
    const isFormData = body instanceof FormData;
    return request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body)
    });
  },
  delete: <T>(endpoint: string, options?: RequestOptions) => request<T>(endpoint, { ...options, method: 'DELETE' }),
  // You can add patch or other methods as needed
};

export default apiClient;
