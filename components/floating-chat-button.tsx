"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { MessageCircleIcon as ChatBubble } from "lucide-react"

interface FloatingChatButtonProps {
  onClick: () => void
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-4 right-4 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 text-white p-3 z-50"
    >
      <ChatBubble size={24} />
    </Button>
  )
}

export default FloatingChatButton
