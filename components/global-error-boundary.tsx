"use client"

import type React from "react"

import { Component, type ReactNode } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { logError } from "@/lib/error-logger"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class GlobalErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to an error reporting service
    console.error("Global error boundary caught an error:", error, errorInfo)
    this.setState({ errorInfo })

    // Log to our error tracking system
    logError(error, {
      severity: "high",
      context: {
        component: "GlobalErrorBoundary",
        errorInfo: errorInfo.componentStack,
      },
    })
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center justify-center text-center mb-6">
              <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
              <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
              <p className="text-gray-600 dark:text-gray-300">
                We've encountered an unexpected error. Please try refreshing the page.
              </p>
            </div>

            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error Details</AlertTitle>
              <AlertDescription className="mt-2 font-mono text-xs overflow-auto max-h-40">
                {this.state.error?.toString() || "Unknown error"}
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-3">
              <Button onClick={this.resetErrorBoundary} className="w-full flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
                className="w-full flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" />
                Return to Home
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                If this problem persists, please contact support.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
