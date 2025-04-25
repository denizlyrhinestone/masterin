import type { ReactNode } from "react"
import { ChatErrorBoundary } from "@/components/chat-error-boundary"

export default function AILayout({ children }: { children: ReactNode }) {
  return <ChatErrorBoundary>{children}</ChatErrorBoundary>
}
