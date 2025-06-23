"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { getAuthToken, setAuthToken, removeAuthToken } from '@/lib/auth';
import { User, AuthState, AuthContextType } from '@/types/authTypes';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start true for initial check
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    const storedToken = getAuthToken();
    if (storedToken) {
      try {
        // Simplified: retrieve user from localStorage if token exists
        // Production: Validate token with backend using an endpoint like /auth/me
        const storedUserString = localStorage.getItem('user_data');
        if (storedUserString) {
          const storedUser: User = JSON.parse(storedUserString);
          setUser(storedUser);
          setToken(storedToken);
          setIsAuthenticated(true);
          apiClient.setAuthToken(storedToken); // Ensure apiClient has the token for subsequent calls
        } else {
          removeAuthToken();
          setIsAuthenticated(false); setUser(null); setToken(null);
          apiClient.setAuthToken(null);
        }
      } catch (err) {
        console.error("Auth check failed during user data parsing:", err);
        removeAuthToken(); localStorage.removeItem('user_data');
        setIsAuthenticated(false); setUser(null); setToken(null);
        apiClient.setAuthToken(null);
      }
    } else {
      setIsAuthenticated(false); setUser(null); setToken(null);
      apiClient.setAuthToken(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email: string, password_raw: string) => {
    setIsLoading(true); setError(null);
    try {
      // Backend auth.js expects 'email' and 'password'.
      const response = await apiClient.post<{ token: string; user: User; message?: string }>('/auth/login', {
        email: email,
        password: password_raw,
      });

      setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      setAuthToken(response.token);
      localStorage.setItem('user_data', JSON.stringify(response.user));
      apiClient.setAuthToken(response.token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setIsAuthenticated(false); setUser(null); setToken(null);
      apiClient.setAuthToken(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password_raw: string, role: 'student' | 'teacher') => {
    setIsLoading(true); setError(null);
    try {
      await apiClient.post<{ user: User; message?: string }>('/auth/signup', {
        email: email,
        password: password_raw,
        role: role,
      });
      // Success: form should handle redirect to login or success message
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true); setError(null);
    try {
      await apiClient.post('/auth/logout', {});
    } catch (err: any) {
      console.error("Logout API call failed:", err.message);
    } finally {
      removeAuthToken();
      localStorage.removeItem('user_data');
      setUser(null); setToken(null); setIsAuthenticated(false);
      apiClient.setAuthToken(null);
      setIsLoading(false);
      router.push('/login');
    }
  };

  const requestPasswordReset = async (email: string) => {
    setIsLoading(true); setError(null);
    try {
      const response = await apiClient.post<{ success: boolean; message: string; _dev_token?: string }>('/auth/request-password-reset', {
        email: email, // Backend auth.js expects 'email'
      });
      return response;
    } catch (err: any) {
      setError(err.message || 'Password reset request failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (resetToken: string, newPassword_raw: string) => {
    setIsLoading(true); setError(null);
    try {
      // Backend auth.js expects 'token' and 'newPassword'
      const response = await apiClient.post<{ success: boolean; message: string }>('/auth/reset-password', {
        token: resetToken,
        newPassword: newPassword_raw,
      });
      return response;
    } catch (err: any) {
      setError(err.message || 'Password reset failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated, isLoading, error,
      login, signup, logout, requestPasswordReset, resetPassword, clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
