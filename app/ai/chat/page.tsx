import type { Metadata } from "next"
import AIChatClientPage from "./AIChatClientPage"

export const metadata: Metadata = {
  title: "AI Chat - Masterin",
  description: "Chat with our AI assistant",
}

export default function AIChatPage() {
  return <AIChatClientPage />
}
