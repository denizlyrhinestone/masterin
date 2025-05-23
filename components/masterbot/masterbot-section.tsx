"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  SendIcon,
  DownloadIcon,
  FileTextIcon,
  RefreshCwIcon,
  CheckIcon,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  FileIcon as FilePdf,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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

  return (
    <section
      className="py-16 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20"
      id="masterbot"
    >
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
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">MasterBot Chat</h3>
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon" className="h-8 w-8">
                                {exportStatus === "exporting" ? (
                                  <RefreshCwIcon className="h-4 w-4 animate-spin" />
                                ) : exportStatus === "success" ? (
                                  <CheckIcon className="h-4 w-4 text-green-500" />
                                ) : (
                                  <DownloadIcon className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleExport("text")}>
                                <FileTextIcon className="mr-2 h-4 w-4" />
                                <span>Export as Text</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExport("markdown")}>
                                <FileTextIcon className="mr-2 h-4 w-4" />
                                <span>Export as Markdown</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExport("json")}>
                                <FileTextIcon className="mr-2 h-4 w-4" />
                                <span>Export as JSON</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                                <FilePdf className="mr-2 h-4 w-4" />
                                <span>Export as PDF</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Export conversation</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <div ref={chatContainerRef} className="h-64 overflow-y-auto mb-4 p-3 bg-muted/50 rounded-md">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2 mb-4 ${msg.role === "user" ? "justify-end" : ""}`}>
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 relative">
                          <Image src="/ai-tutor-interface.png" alt="MasterBot" fill className="object-cover" />
                        </div>
                      )}
                      <div
                        className={`rounded-lg p-3 text-sm max-w-[80%] ${
                          msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-primary/10"
                        } relative group`}
                      >
                        {msg.content}

                        {/* Voice button for assistant messages */}
                        {msg.role === "assistant" && voiceSupported && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background rounded-full"
                            onClick={() => toggleSpeaking(msg.content)}
                          >
                            {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                          </Button>
                        )}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                          <span className="text-xs font-medium">You</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 relative">
                        <Image src="/ai-tutor-interface.png" alt="MasterBot" fill className="object-cover" />
                      </div>
                      <div className="bg-primary/10 rounded-lg p-3 text-sm">
                        <div className="flex gap-1">
                          <span className="animate-bounce">●</span>
                          <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
                            ●
                          </span>
                          <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>
                            ●
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1"
                  />
                  {speechSupported && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            size="icon"
                            variant={isListening ? "default" : "outline"}
                            onClick={toggleListening}
                            className={isListening ? "bg-red-500 hover:bg-red-600" : ""}
                          >
                            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isListening ? "Stop voice input" : "Start voice input"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <Button type="submit" size="icon" disabled={isTyping}>
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
