// src/types/authTypes.ts
export interface User {
  id: number; // or string if UUID
  email: string;
  role: 'student' | 'teacher' | 'admin';
  // Add any other user fields returned by login/signup that you want to store
  // For example: name?: string; created_at?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean; // For initial auth check or during login/signup/logout
  error: string | null; // For login/signup/password-reset errors
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: 'student' | 'teacher') => Promise<void>; // Assuming password confirmation is handled in form
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string; _dev_token?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
  // checkAuth: () => Promise<void>; // Optional: for re-validating token with backend
}
