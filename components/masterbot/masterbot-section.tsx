"use client"

import { useEffect } from "react"

import { useRef } from "react"

import { useState } from "react"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle, Zap, Brain } from "lucide-react"
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  initSpeechRecognition,
  speakText,
  stopSpeaking,
  getPreferredVoice,
} from "@/lib/speech-utils"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function MasterbotSection() {
  const [message, setMessage] = useState("")
  const [chatVisible, setChatVisible] = useState(true) // Set to true to show chat by default
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm MasterBot, your AI learning assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [exportStatus, setExportStatus] = useState<"idle" | "exporting" | "success">("idle")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [preferredVoice, setPreferredVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Check for speech support on component mount
  useEffect(() => {
    const checkSpeechSupport = async () => {
      try {
        const speechRecognitionSupported = isSpeechRecognitionSupported()
        const speechSynthesisSupported = isSpeechSynthesisSupported()

        setSpeechSupported(speechRecognitionSupported)
        setVoiceSupported(speechSynthesisSupported)

        if (speechSynthesisSupported) {
          const voice = await getPreferredVoice()
          setPreferredVoice(voice)
        }
      } catch (error) {
        console.error("Error checking speech support:", error)
        setSpeechSupported(false)
        setVoiceSupported(false)
      }
    }

    checkSpeechSupport()

    // Cleanup speech synthesis on unmount
    return () => {
      if (isSpeechSynthesisSupported()) {
        try {
          stopSpeaking()
        } catch (error) {
          console.error("Error stopping speech:", error)
        }
      }
    }
  }, [])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    // Reset export status after 3 seconds
    if (exportStatus === "success") {
      const timer = setTimeout(() => {
        setExportStatus("idle")
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [exportStatus])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setMessage("")
    setIsTyping(true)

    // Simulate AI response after a delay
    setTimeout(() => {
      const responses = [
        "I understand what you're asking. Let me provide some information on that topic.",
        "That's a great question! Here's what I know about that subject.",
        "I'd be happy to help with that. Here's a detailed explanation.",
        "Let me break that down for you in a way that's easy to understand.",
        "Here's how I would approach that problem step by step.",
      ]

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleExport = (format: "text" | "markdown" | "json" | "pdf") => {
    setExportStatus("exporting")

    try {
      // Convert messages to exportable format
      const exportableMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
      }))

      // Simulate export process
      setTimeout(() => {
        if (format === "text") {
          const text = messages
            .map((msg) => `${msg.role === "user" ? "You" : "MasterBot"}: ${msg.content}`)
            .join("\n\n")

          const blob = new Blob([text], { type: "text/plain" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `masterin-chat-${new Date().toISOString().split("T")[0]}.txt`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        } else if (format === "markdown") {
          const markdown =
            `# MasterBot Chat - ${new Date().toLocaleDateString()}\n\n` +
            messages.map((msg) => `## ${msg.role === "user" ? "You" : "MasterBot"}\n\n${msg.content}\n\n`).join("")

          const blob = new Blob([markdown], { type: "text/markdown" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `masterin-chat-${new Date().toISOString().split("T")[0]}.md`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        } else if (format === "json") {
          const json = JSON.stringify(exportableMessages, null, 2)
          const blob = new Blob([json], { type: "application/json" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `masterin-chat-${new Date().toISOString().split("T")[0]}.json`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        } else {
          // In a real implementation, this would generate a PDF
          console.log("Exporting as PDF")
          // Simulate PDF download
          const text = messages
            .map((msg) => `${msg.role === "user" ? "You" : "MasterBot"}: ${msg.content}`)
            .join("\n\n")
          const blob = new Blob([text], { type: "text/plain" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `masterin-chat-${new Date().toISOString().split("T")[0]}.txt`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }

        setExportStatus("success")
      }, 1000)
    } catch (error) {
      console.error("Export error:", error)
      setExportStatus("idle")
    }
  }

  const toggleListening = () => {
    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (error) {
          console.error("Error stopping speech recognition:", error)
        }
        recognitionRef.current = null
      }
      setIsListening(false)
    } else {
      // Start listening
      try {
        recognitionRef.current = initSpeechRecognition({
          onResult: (transcript) => {
            setMessage(transcript)
            setIsListening(false)
          },
          onStart: () => setIsListening(true),
          onEnd: () => setIsListening(false),
          onError: (error) => {
            console.error("Speech recognition error:", error)
            setIsListening(false)
          },
        })
      } catch (error) {
        console.error("Speech recognition initialization error:", error)
        setIsListening(false)
        setSpeechSupported(false) // Disable the feature if it fails
      }
    }
  }

  const toggleSpeaking = async (messageToSpeak?: string) => {
    if (isSpeaking) {
      try {
        stopSpeaking()
        setIsSpeaking(false)
      } catch (error) {
        console.error("Error stopping speech:", error)
        setIsSpeaking(false)
      }
    } else if (messageToSpeak) {
      try {
        setIsSpeaking(true)
        await speakText(messageToSpeak, {
          voice: preferredVoice,
          onEnd: () => setIsSpeaking(false),
          onError: (error) => {
            console.error("Speech synthesis error:", error)
            setIsSpeaking(false)
          },
        })
      } catch (error) {
        console.error("Speech synthesis error:", error)
        setIsSpeaking(false)
      }
    }
  }

  // Add a proper reset function
  const resetChat = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "Hello! I'm MasterBot, your AI learning assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ])
    setMessage("")
    setIsTyping(false)
    if (isSpeaking) {
      try {
        stopSpeaking()
        setIsSpeaking(false)
      } catch (error) {
        console.error("Error stopping speech:", error)
      }
    }
  }

  return (
    <section
      className="py-16 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20"
      id="masterbot"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">
                Meet <span className="animate-gradient-text">MasterBot</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Your AI-powered learning companion that's available 24/7 to help you master any subject.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Instant Answers</h3>
                  <p className="text-muted-foreground">
                    Get immediate help with homework, concepts, and complex problems.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Adaptive Learning</h3>
                  <p className="text-muted-foreground">
                    Learns your style and adjusts explanations to match your level.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Lightning Fast</h3>
                  <p className="text-muted-foreground">Powered by advanced AI for quick, accurate responses.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="animate-float">
                <Link href="/ai/chat">
                  Try MasterBot Now
                  <MessageCircle className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/ai">Explore All AI Tools</Link>
              </Button>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <Card className="overflow-hidden border-0 shadow-2xl">
              <CardContent className="p-0">
                <div className="relative h-[400px]">
                  <Image src="/ai-tutor-interface.png" alt="MasterBot AI Interface" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </CardContent>
            </Card>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg animate-float">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div
              className="absolute -bottom-4 -left-4 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg animate-float"
              style={{ animationDelay: "1s" }}
            >
              <Zap className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
