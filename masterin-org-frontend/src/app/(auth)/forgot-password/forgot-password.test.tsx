import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordPage from './page'; // Assuming this is the correct path to the page
import { AuthProvider, useAuth } from '@/contexts/AuthContext'; // To provide context

// Mock useAuth hook
const mockRequestPasswordReset = jest.fn();
const mockClearError = jest.fn();
let mockAuthContextState = {
  requestPasswordReset: mockRequestPasswordReset,
  isLoading: false,
  error: null,
  clearError: mockClearError,
};

jest.mock('@/contexts/AuthContext', () => ({
  ...jest.requireActual('@/contexts/AuthContext'), // Keep actual AuthProvider for wrapping
  useAuth: () => mockAuthContextState,
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: jest.fn(() => '/forgot-password'),
  // Add other exports if page uses them, like useSearchParams
}));


describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mockAuthContextState for each test
    mockAuthContextState = {
      requestPasswordReset: mockRequestPasswordReset,
      isLoading: false,
      error: null,
      clearError: mockClearError,
    };
  });

  const renderPage = () => {
    // Wrap with AuthProvider because the page itself might not be,
    // but useAuth() expects to be within one.
    // However, since we are mocking useAuth directly, AuthProvider might not be strictly needed
    // IF the page ONLY uses useAuth. If it renders components that use useAuth,
    // then AuthProvider is good. For this page, direct mock is fine.
    return render(<ForgotPasswordPage />);
  };

  it('renders the forgot password form correctly', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /Forgot your password?/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Login/i })).toBeInTheDocument();
  });

  it('allows typing in the email field', async () => {
    renderPage();
    const emailInput = screen.getByLabelText(/Email address/i) as HTMLInputElement;
    await userEvent.type(emailInput, 'test@example.com');
    expect(emailInput.value).toBe('test@example.com');
  });

  it('calls requestPasswordReset on submit and displays success message', async () => {
    mockRequestPasswordReset.mockResolvedValueOnce({ success: true, message: 'Generic backend success' });
    renderPage();

    const emailInput = screen.getByLabelText(/Email address/i);
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });

    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith('test@example.com');
    });
    await waitFor(() => {
      expect(screen.getByText(/If an account with that email exists, a password reset link has been sent/i)).toBeInTheDocument();
    });
    expect((emailInput as HTMLInputElement).value).toBe(''); // Email field should be cleared
    expect(mockAuthContextState.clearError).toHaveBeenCalled(); // Global error should be cleared
  });

  it('displays an error message if requestPasswordReset fails (e.g., network error)', async () => {
    const errorMessage = 'Network error, please try again.';
    // Simulate requestPasswordReset throwing an error, and AuthContext setting its error state
    mockRequestPasswordReset.mockRejectedValueOnce(new Error(errorMessage));
    // Update the mocked context state that the component will consume
    mockAuthContextState.error = errorMessage;

    renderPage();

    const emailInput = screen.getByLabelText(/Email address/i);
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });

    await userEvent.type(emailInput, 'test@example.com');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith('test@example.com');
    });
    await waitFor(() => {
      // The error displayed should be the one from the mocked useAuth().error
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows loading state on button when submitting', async () => {
    mockAuthContextState.isLoading = true; // Simulate loading state from useAuth
    renderPage();
    const submitButton = screen.getByRole('button', { name: /Sending.../i }); // Text changes when isLoading
    expect(submitButton).toBeDisabled();
  });

  it('clears errors on mount', () => {
    renderPage();
    expect(mockClearError).toHaveBeenCalledTimes(1); // Called once on initial mount
  });
});
