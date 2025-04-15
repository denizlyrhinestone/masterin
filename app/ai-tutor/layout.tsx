import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Tutor | Educational Platform",
  description: "Get personalized learning assistance with our AI tutor",
}

export default function AiTutorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-gray-50">{children}</div>
}
