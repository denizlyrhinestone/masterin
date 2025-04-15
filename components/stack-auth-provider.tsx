"use client"

import { useEffect, useState, createContext, useContext, type ReactNode } from "react"
import { initStackClient, stackClientConfig } from "@/lib/stack-client"
import { handleSignIn, verifySession } from "@/app/actions/auth-actions"

// Define the user type
interface User {
  id: string
  email: string
  name?: string
}

// Define the auth context type
interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: () => void
  signOut: () => void
}

// Create the auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: () => {},
  signOut: () => {},
})

// Auth provider props
interface AuthProviderProps {
  children: ReactNode
}

// Auth provider component
export function StackAuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize Stack client
  useEffect(() => {
    if (stackClientConfig.projectId) {
      initStackClient()
      checkSession()
    }
  }, [])

  // Check for existing session
  const checkSession = async () => {
    try {
      setIsLoading(true)

      // Check for a saved session token
      const sessionToken = localStorage.getItem("stack_session_token")

      if (sessionToken) {
        // Verify the session using a server action
        const result = await verifySession(sessionToken)

        if (result.valid && result.user) {
          setUser(result.user)
        } else {
          // Clear invalid session
          localStorage.removeItem("stack_session_token")
        }
      }
    } catch (error) {
      console.error("Error checking session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Sign in function
  const signIn = async () => {
    try {
      setIsLoading(true)

      // Use server action to handle sign in
      const result = await handleSignIn()

      if (result.success && result.user) {
        setUser(result.user)

        // In a real implementation, we would save the session token
        localStorage.setItem("stack_session_token", "demo-session-token")
      }
    } catch (error) {
      console.error("Error signing in:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Sign out function
  const signOut = () => {
    setUser(null)
    localStorage.removeItem("stack_session_token")
  }

  return <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  return useContext(AuthContext)
}
