import React, { ReactNode } from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import apiClient from '@/lib/apiClient';
import { getAuthToken, removeAuthToken, setAuthToken } from '@/lib/auth'; // Direct import for mocking

// Mock apiClient
jest.mock('@/lib/apiClient');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Mock next/navigation
const mockRouterPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => ({ get: jest.fn() })),
}));

// Mock @/lib/auth (localStorage interaction)
jest.mock('@/lib/auth', () => ({
  getAuthToken: jest.fn(),
  setAuthToken: jest.fn(),
  removeAuthToken: jest.fn(),
}));
const mockedGetAuthToken = getAuthToken as jest.Mock;
const mockedSetAuthToken = setAuthToken as jest.Mock;
const mockedRemoveAuthToken = removeAuthToken as jest.Mock;

// Helper Test Component
const TestConsumerComponent = ({ action, payload }: { action?: string; payload?: any }) => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="isAuthenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="user">{JSON.stringify(auth.user)}</div>
      <div data-testid="token">{auth.token}</div>
      <div data-testid="isLoading">{auth.isLoading.toString()}</div>
      <div data-testid="error">{auth.error}</div>
      {action === 'login' && <button onClick={() => auth.login(payload.email, payload.password)}>Login</button>}
      {action === 'logout' && <button onClick={auth.logout}>Logout</button>}
      {action === 'signup' && <button onClick={() => auth.signup(payload.email, payload.password, payload.role)}>Signup</button>}
      {action === 'requestPasswordReset' && <button onClick={() => auth.requestPasswordReset(payload.email)}>Request Reset</button>}
      {action === 'resetPassword' && <button onClick={() => auth.resetPassword(payload.token, payload.newPassword)}>Reset Password</button>}
      {action === 'clearError' && <button onClick={auth.clearError}>Clear Error</button>}
    </div>
  );
};

const renderWithAuthProvider = (ui: ReactNode) => {
  return render(<AuthProvider>{ui}</AuthProvider>);
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear mock localStorage via the mocked auth functions
    mockedGetAuthToken.mockReturnValue(null);
    // Mock localStorage directly if not fully covered by lib/auth mocks for this test's purpose
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockedGetAuthToken, // Simplified: getAuthToken directly returns token or null
        setItem: jest.fn(), // For user_data
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  it('initial state is not authenticated, no user/token, not loading (after check)', async () => {
    mockedGetAuthToken.mockReturnValue(null); // No token in localStorage
    renderWithAuthProvider(<TestConsumerComponent />);

    await waitFor(() => expect(screen.getByTestId('isLoading').textContent).toBe('false'));
    expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('token').textContent).toBe(''); // or 'null' depending on initial state in context
  });

  describe('checkAuthStatus', () => {
    it('authenticates if token is valid and /me endpoint returns profile', async () => {
      const mockUser = { id: 1, email: 'test@example.com', role: 'student', full_name: 'Test User' };
      const mockToken = 'valid-token';
      mockedGetAuthToken.mockReturnValue(mockToken);
      // localStorage.getItem for 'user_data' will be called by checkAuthStatus if token is present and /me fails (old logic)
      // New logic: /me is primary source of user data after token found
      mockedApiClient.get.mockResolvedValue({ profile: mockUser } as any); // Mock /users/profile/me

      renderWithAuthProvider(<TestConsumerComponent />);

      await waitFor(() => expect(screen.getByTestId('isLoading').textContent).toBe('false'));
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
      expect(JSON.parse(screen.getByTestId('user').textContent || '{}')).toEqual(mockUser);
      expect(screen.getByTestId('token').textContent).toBe(mockToken);
      expect(window.localStorage.setItem).toHaveBeenCalledWith('user_data', JSON.stringify(mockUser));
    });

    it('does not authenticate if token is invalid (e.g., /me fails)', async () => {
      mockedGetAuthToken.mockReturnValue('invalid-token');
      mockedApiClient.get.mockRejectedValue(new Error('Invalid token')); // Mock /users/profile/me failure

      renderWithAuthProvider(<TestConsumerComponent />);

      await waitFor(() => expect(screen.getByTestId('isLoading').textContent).toBe('false'));
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('null');
      expect(mockedRemoveAuthToken).toHaveBeenCalled();
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('user_data');
    });
  });

  describe('login', () => {
    it('logs in successfully, updates state, localStorage, and redirects', async () => {
      const mockLoginResponse = {
        token: 'new-jwt-token',
        user: { id: 1, email: 'login@example.com', role: 'student', full_name: 'Login User' },
        message: 'Logged in'
      };
      mockedApiClient.post.mockResolvedValue(mockLoginResponse);

      renderWithAuthProvider(<TestConsumerComponent action="login" payload={{ email: 'login@example.com', password: 'password' }} />);

      fireEvent.click(screen.getByRole('button', { name: /Login/i }));

      await waitFor(() => expect(screen.getByTestId('isLoading').textContent).toBe('false'));
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
      expect(JSON.parse(screen.getByTestId('user').textContent || '{}')).toEqual(mockLoginResponse.user);
      expect(screen.getByTestId('token').textContent).toBe(mockLoginResponse.token);
      expect(mockedSetAuthToken).toHaveBeenCalledWith(mockLoginResponse.token);
      expect(window.localStorage.setItem).toHaveBeenCalledWith('user_data', JSON.stringify(mockLoginResponse.user));
      expect(mockRouterPush).toHaveBeenCalledWith('/dashboard');
    });

    it('handles login failure and sets error state', async () => {
      mockedApiClient.post.mockRejectedValue(new Error('Invalid credentials'));
      renderWithAuthProvider(<TestConsumerComponent action="login" payload={{ email: 'fail@example.com', password: 'wrong' }} />);

      fireEvent.click(screen.getByRole('button', { name: /Login/i }));

      await waitFor(() => expect(screen.getByTestId('isLoading').textContent).toBe('false'));
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
      expect(screen.getByTestId('error').textContent).toBe('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('logs out successfully, clears state, localStorage, and redirects', async () => {
      // Simulate initial logged-in state
      mockedGetAuthToken.mockReturnValue('logged-in-token');
      const mockUser = { id: 1, email: 'logout@example.com', role: 'student', full_name: 'Logout User' };
      (window.localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'jwt_token') return 'logged-in-token';
        if (key === 'user_data') return JSON.stringify(mockUser);
        return null;
      });
      mockedApiClient.get.mockResolvedValue({ profile: mockUser } as any); // For initial checkAuthStatus
      mockedApiClient.post.mockResolvedValue({}); // For /auth/logout call

      renderWithAuthProvider(<TestConsumerComponent action="logout" />);

      // Wait for initial auth check to complete
      await waitFor(() => expect(screen.getByTestId('isAuthenticated').textContent).toBe('true'));

      fireEvent.click(screen.getByRole('button', { name: /Logout/i }));

      await waitFor(() => expect(screen.getByTestId('isLoading').textContent).toBe('false'));
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('null');
      expect(screen.getByTestId('token').textContent).toBe('');
      expect(mockedRemoveAuthToken).toHaveBeenCalled();
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('user_data');
      expect(mockRouterPush).toHaveBeenCalledWith('/login');
    });
  });

  describe('requestPasswordReset', () => {
    it('calls apiClient and returns response on success', async () => {
        const mockApiResponse = { success: true, message: 'Generic success from backend' };
        mockedApiClient.post.mockResolvedValue({ data: mockApiResponse }); // apiClient wraps in .data

        renderWithAuthProvider(<TestConsumerComponent action="requestPasswordReset" payload={{ email: 'reset@example.com' }} />);

        // Need to get the function from useAuth and call it, or have button trigger it
        let authContext;
        const TestComponent = () => {
            authContext = useAuth();
            return null;
        };
        render(<AuthProvider><TestComponent/></AuthProvider>);

        await act(async () => {
            const result = await (authContext as AuthContextType).requestPasswordReset('reset@example.com');
            expect(result).toEqual(mockApiResponse);
        });
        expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/request-password-reset', { email_address: 'reset@example.com' });
    });
  });

   describe('clearError', () => {
    it('clears the error state', async () => {
      mockedApiClient.post.mockRejectedValue(new Error('Initial Error'));
      renderWithAuthProvider(
        <TestConsumerComponent action="login" payload={{ email: 'error@example.com', password: 'err' }} />
      );

      // Trigger login to set an error
      fireEvent.click(screen.getByRole('button', { name: /Login/i }));
      await waitFor(() => expect(screen.getByTestId('error').textContent).toBe('Initial Error'));

      // Trigger clearError
      // To do this, we need another button or to expose clearError in TestConsumerComponent
      // For simplicity, let's assume TestConsumerComponent has a button for it
      const TestComponentWithClear = () => {
          const { error, clearError: clear, login } = useAuth();
          return (
            <div>
              <div data-testid="error">{error}</div>
              <button onClick={() => login("e","p")}>Set Error</button>
              <button onClick={clear}>Clear Error Btn</button>
            </div>
          );
      }
      render(<AuthProvider><TestComponentWithClear/></AuthProvider>);
      fireEvent.click(screen.getByRole('button', {name: /Set Error/i}));
      await waitFor(() => expect(screen.getByTestId('error').textContent).toBe('Initial Error'));
      fireEvent.click(screen.getByRole('button', {name: /Clear Error Btn/i}));
      expect(screen.getByTestId('error').textContent).toBe(''); // Error should be null, so empty string in UI
    });
  });

});
