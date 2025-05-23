"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send, Copy, Check, Download, FileText, FileJson, FileDown, Filter, FileIcon as FilePdf } from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { exportLargeChat, filterMessagesByDateRange } from "@/lib/chat-export-utils"
import { PDFPreview } from "./pdf-preview"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp?: number
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [exportProgress, setExportProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportFormat, setExportFormat] = useState<"text" | "markdown" | "json" | "pdf">("text")
  const [exportTitle, setExportTitle] = useState("Masterin Chat")
  const [exportStartDate, setExportStartDate] = useState<string>("")
  const [exportEndDate, setExportEndDate] = useState<string>("")
  const [pdfPreviewPages, setPdfPreviewPages] = useState<string[]>([])
  const [showPdfPreview, setShowPdfPreview] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Reset copied message ID after 2 seconds
  useEffect(() => {
    if (copiedMessageId) {
      const timer = setTimeout(() => {
        setCopiedMessageId(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [copiedMessageId])

  // Add initial greeting message
  useEffect(() => {
    setMessages([
      {
        id: "greeting",
        role: "assistant",
        content: "👋 Hello! I'm MasterBot, your AI assistant for Masterin. How can I help you today?",
        timestamp: Date.now(),
      },
    ])
  }, [])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Create a new user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: Date.now(),
    }

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      // Prepare the request payload
      const payload = {
        messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
        conversationId,
      }

      // Send the request to the API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      // Check if the response is OK
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Error response:", errorData)
        throw new Error(`Error: ${response.status} ${errorData.error || response.statusText}`)
      }

      // Get the conversation ID from the response headers
      const newConversationId = response.headers.get("x-conversation-id")
      if (newConversationId) {
        setConversationId(newConversationId)
      }

      // Parse the response
      const data = await response.json()

      // Add the assistant's response to the chat
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.text,
          timestamp: Date.now(),
        },
      ])
    } catch (error) {
      console.error("Error sending message:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleCopyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopiedMessageId(id)
    toast({
      title: "Copied to clipboard",
      description: "Message content has been copied to your clipboard",
    })
  }

  const handleExport = async () => {
    if (messages.length <= 1) {
      toast({
        title: "Nothing to export",
        description: "Start a conversation first before exporting",
        variant: "destructive",
      })
      return
    }

    setShowExportDialog(true)
  }

  // Function to generate PDF preview
  const generatePdfPreview = async (messagesToExport: Message[]) => {
    try {
      // Create a canvas element for PDF generation
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        throw new Error("Could not create canvas context for PDF generation")
      }

      // Set canvas dimensions (letter size in points: 8.5 x 11 inches at 72 DPI)
      canvas.width = 612
      canvas.height = 792

      // Brand colors
      const colors = {
        primary: "#6366f1", // Indigo
        secondary: "#4f46e5", // Darker indigo
        userBubble: "#6366f1", // Indigo for user messages
        assistantBubble: "#f3f4f6", // Light gray for assistant messages
        userText: "#ffffff", // White text for user messages
        assistantText: "#1f2937", // Dark gray text for assistant messages
        lightGray: "#e5e7eb",
        mediumGray: "#9ca3af",
        darkGray: "#4b5563",
        black: "#111827",
      }

      // PDF configuration
      const margin = 50
      const contentWidth = canvas.width - margin * 2
      const lineHeight = 20
      let currentY = 140 // Start below the header
      let pageNum = 1

      // Store pages as data URLs
      const previewPages: string[] = []

      // Function to create a new page
      const createPage = () => {
        // Clear canvas
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw header background
        ctx.fillStyle = colors.primary
        ctx.fillRect(0, 0, canvas.width, 80)

        // Draw logo (simplified version using text)
        ctx.fillStyle = "white"
        ctx.font = "bold 24px Arial"
        ctx.fillText("Masterin", margin, 40)

        // Draw title
        ctx.font = "16px Arial"
        ctx.fillText(exportTitle, margin, 65)

        // Draw export date in header
        ctx.font = "10px Arial"
        ctx.textAlign = "right"
        ctx.fillText(`Exported on: ${new Date().toLocaleString()}`, canvas.width - margin, 40)

        // Draw page number in header
        ctx.fillText(`Page ${pageNum}`, canvas.width - margin, 65)

        // Reset text alignment
        ctx.textAlign = "left"

        // Draw footer
        ctx.fillStyle = colors.lightGray
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40)

        // Draw footer text
        ctx.fillStyle = colors.darkGray
        ctx.font = "10px Arial"
        ctx.fillText("Generated by Masterin AI Assistant", margin, canvas.height - 20)

        // Draw website URL in footer
        ctx.textAlign = "right"
        ctx.fillText("masterin.org", canvas.width - margin, canvas.height - 20)

        // Reset text alignment
        ctx.textAlign = "left"

        // Reset Y position
        currentY = 120
        pageNum++
      }

      // Function to add text with word wrapping
      const addText = (text: string, font: string, color: string, x: number, maxWidth: number) => {
        ctx.font = font
        ctx.fillStyle = color
        const words = text.split(" ")
        let line = ""

        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + " "
          const metrics = ctx.measureText(testLine)

          if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line, x, currentY)
            line = words[i] + " "
            currentY += lineHeight

            // Check if we need a new page
            if (currentY > canvas.height - 60) {
              // Add current page to PDF
              const pageData = canvas.toDataURL("image/jpeg", 0.95)
              previewPages.push(pageData)

              // Create new page
              createPage()
            }
          } else {
            line = testLine
          }
        }

        // Draw the last line
        ctx.fillText(line, x, currentY)
        currentY += lineHeight
      }

      // Function to draw a message bubble
      const drawMessageBubble = (
        message: Message,
        bubbleColor: string,
        textColor: string,
        alignment: "left" | "right",
      ) => {
        const bubbleMargin = alignment === "right" ? margin + 80 : margin
        const bubbleWidth = contentWidth - 80
        const bubbleRadius = 10

        // Calculate text height
        ctx.font = "12px Arial"
        const textLines = wordWrap(message.content, bubbleWidth - 20, ctx)
        const textHeight = textLines.length * lineHeight + 30 // Add padding

        // Draw bubble
        ctx.fillStyle = bubbleColor
        roundRect(
          ctx,
          alignment === "right" ? canvas.width - bubbleMargin - bubbleWidth : bubbleMargin,
          currentY - 15,
          bubbleWidth,
          textHeight,
          bubbleRadius,
        )

        // Draw timestamp if available
        if (message.timestamp) {
          ctx.font = "italic 10px Arial"
          ctx.fillStyle = alignment === "right" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.5)"
          const timestamp = new Date(message.timestamp).toLocaleString()
          const timestampX = alignment === "right" ? canvas.width - bubbleMargin - 15 : bubbleMargin + 15
          ctx.textAlign = alignment === "right" ? "right" : "left"
          ctx.fillText(timestamp, timestampX, currentY)
          currentY += 20
        }

        // Draw role indicator
        ctx.font = "bold 12px Arial"
        ctx.fillStyle = textColor
        const roleText = message.role === "user" ? "You" : "Assistant"
        const roleX = alignment === "right" ? canvas.width - bubbleMargin - 15 : bubbleMargin + 15
        ctx.textAlign = alignment === "right" ? "right" : "left"
        ctx.fillText(roleText, roleX, currentY)
        currentY += 25

        // Reset text alignment
        ctx.textAlign = "left"

        // Draw message content
        const contentX = alignment === "right" ? canvas.width - bubbleMargin - bubbleWidth + 15 : bubbleMargin + 15

        // Draw each line of text
        ctx.font = "12px Arial"
        ctx.fillStyle = textColor
        textLines.forEach((line) => {
          ctx.fillText(line, contentX, currentY)
          currentY += lineHeight
        })

        // Add spacing after message
        currentY += 20
      }

      // Helper function to wrap text
      function wordWrap(text: string, maxWidth: number, context: CanvasRenderingContext2D): string[] {
        const words = text.split(" ")
        const lines: string[] = []
        let currentLine = ""

        for (let i = 0; i < words.length; i++) {
          const testLine = currentLine + words[i] + " "
          const metrics = context.measureText(testLine)

          if (metrics.width > maxWidth && i > 0) {
            lines.push(currentLine)
            currentLine = words[i] + " "
          } else {
            currentLine = testLine
          }
        }

        lines.push(currentLine)
        return lines
      }

      // Helper function to draw rounded rectangles
      function roundRect(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        radius: number,
      ) {
        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + width - radius, y)
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
        ctx.lineTo(x + width, y + height - radius)
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
        ctx.lineTo(x + radius, y + height)
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
        ctx.lineTo(x, y + radius)
        ctx.quadraticCurveTo(x, y, x + radius, y)
        ctx.closePath()
        ctx.fill()
      }

      // Initialize first page
      createPage()

      // Draw conversation summary
      ctx.fillStyle = colors.black
      ctx.font = "bold 14px Arial"
      ctx.fillText("Conversation Summary", margin, currentY)
      currentY += 25

      ctx.font = "12px Arial"
      ctx.fillText(`Total messages: ${messagesToExport.length}`, margin, currentY)
      currentY += 20

      const userMessages = messagesToExport.filter((m) => m.role === "user").length
      const assistantMessages = messagesToExport.filter((m) => m.role === "assistant").length
      ctx.fillText(`User messages: ${userMessages}`, margin, currentY)
      currentY += 20
      ctx.fillText(`Assistant messages: ${assistantMessages}`, margin, currentY)
      currentY += 30

      // Draw separator
      ctx.strokeStyle = colors.lightGray
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(margin, currentY)
      ctx.lineTo(canvas.width - margin, currentY)
      ctx.stroke()
      currentY += 30

      // Process each message
      for (const message of messagesToExport) {
        // Check if we need a new page
        if (currentY > canvas.height - 100) {
          // Add current page to PDF
          const pageData = canvas.toDataURL("image/jpeg", 0.95)
          previewPages.push(pageData)

          // Create new page
          createPage()
        }

        // Draw message bubble based on role
        if (message.role === "user") {
          drawMessageBubble(message, colors.userBubble, colors.userText, "right")
        } else {
          drawMessageBubble(message, colors.assistantBubble, colors.assistantText, "left")
        }
      }

      // Add the last page
      const lastPageData = canvas.toDataURL("image/jpeg", 0.95)
      previewPages.push(lastPageData)

      return previewPages
    } catch (error) {
      console.error("Error generating PDF preview:", error)
      return []
    }
  }

  const handleExportConfirm = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Filter messages by date range if specified
      let messagesToExport = [...messages]

      if (exportStartDate || exportEndDate) {
        const startDate = exportStartDate ? new Date(exportStartDate) : undefined
        const endDate = exportEndDate ? new Date(exportEndDate) : undefined
        messagesToExport = filterMessagesByDateRange(messagesToExport, startDate, endDate)
      }

      // Skip greeting message if it exists
      messagesToExport = messagesToExport.filter((msg) => msg.id !== "greeting")

      if (messagesToExport.length === 0) {
        toast({
          title: "No messages to export",
          description: "There are no messages matching your filter criteria",
          variant: "destructive",
        })
        setIsExporting(false)
        return
      }

      // If PDF format is selected, generate preview first
      if (exportFormat === "pdf") {
        const previewPages = await generatePdfPreview(messagesToExport)
        setPdfPreviewPages(previewPages)
        setShowPdfPreview(true)
        setShowExportDialog(false)
        setIsExporting(false)
        return
      }

      // Export based on selected format
      const result = await exportLargeChat(messagesToExport, exportFormat, exportTitle, {
        onProgress: (progress) => setExportProgress(progress),
      })

      if (result.success) {
        toast({
          title: "Export successful",
          description: `Your conversation has been exported as ${exportFormat.toUpperCase()}`,
        })
      } else {
        throw new Error(result.error?.message || "Export failed")
      }
    } catch (error) {
      console.error("Error exporting:", error)
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export conversation",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
      setShowExportDialog(false)
    }
  }

  const handleDownloadPdf = async () => {
    setIsExporting(true)

    try {
      // Filter messages by date range if specified
      let messagesToExport = [...messages]

      if (exportStartDate || exportEndDate) {
        const startDate = exportStartDate ? new Date(exportStartDate) : undefined
        const endDate = exportEndDate ? new Date(exportEndDate) : undefined
        messagesToExport = filterMessagesByDateRange(messagesToExport, startDate, endDate)
      }

      // Skip greeting message if it exists
      messagesToExport = messagesToExport.filter((msg) => msg.id !== "greeting")

      // Export as PDF
      const result = await exportLargeChat(messagesToExport, "pdf", exportTitle, {
        onProgress: (progress) => setExportProgress(progress),
      })

      if (result.success) {
        toast({
          title: "Export successful",
          description: "Your conversation has been exported as PDF",
        })
      } else {
        throw new Error(result.error?.message || "Export failed")
      }
    } catch (error) {
      console.error("Error exporting:", error)
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export conversation",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
      setShowPdfPreview(false)
    }
  }

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-3xl mx-auto overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-semibold">MasterBot Assistant</h3>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setExportFormat("text")
                  handleExport()
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export as Text
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setExportFormat("markdown")
                  handleExport()
                }}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setExportFormat("json")
                  handleExport()
                }}
              >
                <FileJson className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setExportFormat("pdf")
                  handleExport()
                }}
              >
                <FilePdf className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setExportFormat("text")
                  setExportTitle("Masterin Chat")
                  handleExport()
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced Export...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "rounded-lg px-4 py-2 max-w-[85%] break-words relative group",
                message.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100",
              )}
            >
              {message.timestamp && (
                <div className="text-xs opacity-50 mb-1">{new Date(message.timestamp).toLocaleTimeString()}</div>
              )}

              {message.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">{message.content}</p>
              )}

              {message.role === "assistant" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleCopyMessage(message.content, message.id)}
                >
                  {copiedMessageId === message.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <div className="flex space-x-2 items-center">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse delay-150"></div>
                <span className="text-sm ml-2">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="rounded-lg px-4 py-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm">
              <p className="font-medium">Error: {error}</p>
              <p className="mt-1">Please try again or refresh the page.</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </div>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Conversation</DialogTitle>
            <DialogDescription>Customize your export options below.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="exportTitle" className="text-right">
                Title
              </Label>
              <Input
                id="exportTitle"
                value={exportTitle}
                onChange={(e) => setExportTitle(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="exportFormat" className="text-right">
                Format
              </Label>
              <Select
                value={exportFormat}
                onValueChange={(value) => setExportFormat(value as "text" | "markdown" | "json" | "pdf")}
              >
                <SelectTrigger className="col-span-3" id="exportFormat">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text (.txt)</SelectItem>
                  <SelectItem value="markdown">Markdown (.md)</SelectItem>
                  <SelectItem value="json">JSON (.json)</SelectItem>
                  <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>

          {isExporting && (
            <div className="mb-4">
              <Label className="mb-2 block">Export Progress</Label>
              <Progress value={exportProgress} className="h-2" />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)} disabled={isExporting}>
              Cancel
            </Button>
            <Button onClick={handleExportConfirm} disabled={isExporting}>
              {isExporting ? "Exporting..." : exportFormat === "pdf" ? "Preview PDF" : "Export"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Preview */}
      {showPdfPreview && (
        <PDFPreview
          pages={pdfPreviewPages}
          title={exportTitle}
          onClose={() => setShowPdfPreview(false)}
          onDownload={handleDownloadPdf}
        />
      )}
    </Card>
  )
}
