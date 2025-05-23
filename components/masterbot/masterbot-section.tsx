"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SendIcon } from "lucide-react"

export function MasterbotSection() {
  const [message, setMessage] = useState("")
  const [chatVisible, setChatVisible] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send the message to an API
    console.log("Message sent:", message)
    setMessage("")
  }

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-4">Meet MasterBot</h2>
            <p className="text-xl mb-6 text-muted-foreground">
              Your personal AI learning assistant that helps you master any subject. Ask questions, get explanations,
              and receive personalized learning recommendations.
            </p>

            {!chatVisible ? (
              <Button
                size="lg"
                onClick={() => setChatVisible(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                Try MasterBot Now
              </Button>
            ) : (
              <div className="bg-background rounded-lg shadow-xl p-4 max-w-md">
                <div className="h-64 overflow-y-auto mb-4 p-3 bg-muted/50 rounded-md">
                  <div className="flex gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 relative">
                      <Image src="/ai-tutor-interface.png" alt="MasterBot" fill className="object-cover" />
                    </div>
                    <div className="bg-primary/10 rounded-lg p-3 text-sm max-w-[80%]">
                      Hello! I'm MasterBot, your AI learning assistant. How can I help you today?
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <SendIcon className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}
          </div>

          <div className="flex-1 relative h-[400px] w-full rounded-xl overflow-hidden shadow-2xl">
            <Image src="/ai-tutor-interface.png" alt="MasterBot Interface" fill className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  )
}
