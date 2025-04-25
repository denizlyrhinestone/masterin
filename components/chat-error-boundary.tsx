"use client"

import type React from "react"

import { Component, type ReactNode } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  countdown: number
}

export class ChatErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      countdown: 5,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, countdown: 5 }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Chat error boundary caught an error:", error, errorInfo)
  }

  componentDidUpdate(prevProps: any, prevState: ErrorBoundaryState) {
    // Handle countdown
    if (this.state.hasError && this.state.countdown > 0 && prevState.countdown === this.state.countdown) {
      setTimeout(() => {
        this.setState((state) => ({ ...state, countdown: state.countdown - 1 }))
      }, 1000)
    }

    // Auto-reset when countdown reaches 0
    if (this.state.hasError && this.state.countdown === 0 && prevState.countdown === 1) {
      this.resetErrorBoundary()
    }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null, countdown: 5 })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error!}
          resetErrorBoundary={this.resetErrorBoundary}
          countdown={this.state.countdown}
        />
      )
    }

    return this.props.children
  }
}

function ErrorFallback({
  error,
  resetErrorBoundary,
  countdown,
}: {
  error: Error
  resetErrorBoundary: () => void
  countdown: number
}) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 text-center">
      <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
      <h2 className="text-xl font-bold mb-2">Chat Error</h2>
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Error Details</AlertTitle>
        <AlertDescription>{error.message || "An unexpected error occurred in the chat interface"}</AlertDescription>
      </Alert>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Auto-recovering in {countdown} seconds...</p>
      <div className="flex gap-4">
        <Button onClick={resetErrorBoundary} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Reset Now
        </Button>
        <Button variant="outline" onClick={() => router.push("/")}>
          Return to Home
        </Button>
      </div>
    </div>
  )
}
