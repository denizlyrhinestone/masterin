"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo)
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <Card className="w-full max-w-md mx-auto my-8">
            <CardHeader>
              <CardTitle className="text-destructive">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                An error occurred while rendering this component. Please try refreshing the page.
              </p>
              {this.state.error && (
                <pre className="mt-4 p-4 bg-muted rounded-md text-xs overflow-auto">{this.state.error.message}</pre>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => window.location.reload()}>Refresh Page</Button>
            </CardFooter>
          </Card>
        )
      )
    }

    return this.props.children
  }
}
