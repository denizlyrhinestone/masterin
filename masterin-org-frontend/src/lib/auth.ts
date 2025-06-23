// src/lib/auth.ts

/**
 * Retrieves the JWT token from localStorage.
 * In a real application, this might come from an HttpOnly cookie, React Context, or a state management store.
 *
 * Developer Note: To test authenticated endpoints:
 * 1. Manually log in via a backend API client (e.g., Postman or curl) with a 'teacher' or 'admin' user.
 * 2. Obtain the JWT token from the login response.
 * 3. In your browser's developer console (for the MasterIn.org frontend domain), run:
 *    `localStorage.setItem('jwt_token', 'your_actual_jwt_token_here');`
 * 4. Refresh the frontend page to allow the API client to pick up the token.
 */
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jwt_token');
    // if (!token) {
    //   console.warn("Auth token not found in localStorage. Authenticated API calls may fail.");
    // }
    return token;
  }
  return null;
};

// Optional: Function to set token (e.g., after login)
export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jwt_token', token);
  }
};

// Optional: Function to remove token (e.g., on logout)
export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jwt_token');
  }
};
