import type { ReactNode } from "react"
import ErrorBoundary from "@/components/error-boundary"
import { ChatErrorFallback } from "@/components/chat-error-boundary"

export default function AILayout({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetErrorBoundary }) => (
        <ChatErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
      )}
    >
      {children}
    </ErrorBoundary>
  )
}
