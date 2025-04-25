import type { ReactNode } from "react"

export default function AILayout({ children }: { children: ReactNode }) {
  // Remove the error boundary for now to isolate the issue
  return <>{children}</>
}
