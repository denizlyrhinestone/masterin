/**
 * Utility functions for exporting chat history in various formats
 */

// Define the message type based on the existing chat interface
export type ExportableMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp?: number
}

/**
 * Helper function to download a file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  // Create a blob with the data
  const blob = new Blob([content], { type: mimeType })

  // Create a URL for the blob
  const url = URL.createObjectURL(blob)

  // Create a temporary anchor element
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)

  // Trigger a click on the anchor
  a.click()

  // Clean up
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Export chat history as plain text
 */
export function exportAsText(messages: ExportableMessage[], title = "Chat Conversation"): void {
  try {
    // Create text content
    let text = `${title}\n`
    text += `Exported on: ${new Date().toLocaleString()}\n\n`

    messages.forEach((message) => {
      const timestamp = message.timestamp ? `[${new Date(message.timestamp).toLocaleString()}] ` : ""
      text += `${timestamp}${message.role === "user" ? "You" : "Assistant"}: ${message.content}\n\n`
    })

    // Download the file
    downloadFile(text, `${formatFileName(title)}.txt`, "text/plain;charset=utf-8")

    return { success: true }
  } catch (error) {
    console.error("Error exporting as text:", error)
    return { success: false, error }
  }
}

/**
 * Export chat history as Markdown
 */
export function exportAsMarkdown(messages: ExportableMessage[], title = "Chat Conversation"): void {
  try {
    // Create markdown content
    let markdown = `# ${title}\n\n`
    markdown += `*Exported on: ${new Date().toLocaleString()}*\n\n`

    messages.forEach((message) => {
      const timestamp = message.timestamp ? `*${new Date(message.timestamp).toLocaleString()}*\n\n` : ""
      const role = message.role === "user" ? "### You" : "### Assistant"
      markdown += `${role}\n\n${timestamp}${message.content}\n\n---\n\n`
    })

    // Download the file
    downloadFile(markdown, `${formatFileName(title)}.md`, "text/markdown;charset=utf-8")

    return { success: true }
  } catch (error) {
    console.error("Error exporting as markdown:", error)
    return { success: false, error }
  }
}

/**
 * Export chat history as JSON
 */
export function exportAsJSON(messages: ExportableMessage[], title = "Chat Conversation"): void {
  try {
    // Create JSON content
    const jsonData = {
      title,
      exportedAt: new Date().toISOString(),
      messages: messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp || new Date().getTime(),
      })),
    }

    // Download the file
    downloadFile(JSON.stringify(jsonData, null, 2), `${formatFileName(title)}.json`, "application/json;charset=utf-8")

    return { success: true }
  } catch (error) {
    console.error("Error exporting as JSON:", error)
    return { success: false, error }
  }
}

/**
 * Export chat history as PDF with enhanced styling and branding
 */
export async function exportAsPDF(
  messages: ExportableMessage[],
  title = "Chat Conversation",
): Promise<{ success: boolean; error?: Error }> {
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
    const pages: string[] = []

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
      ctx.fillText(title, margin, 65)

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
            pages.push(pageData)

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
      message: ExportableMessage,
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
    ctx.fillText(`Total messages: ${messages.length}`, margin, currentY)
    currentY += 20

    const userMessages = messages.filter((m) => m.role === "user").length
    const assistantMessages = messages.filter((m) => m.role === "assistant").length
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
    for (const message of messages) {
      // Check if we need a new page
      if (currentY > canvas.height - 100) {
        // Add current page to PDF
        const pageData = canvas.toDataURL("image/jpeg", 0.95)
        pages.push(pageData)

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
    pages.push(lastPageData)

    // Create PDF document
    const pdfBlob = await createPDFFromImages(pages)

    // Download the PDF
    const url = URL.createObjectURL(pdfBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${formatFileName(title)}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return { success: true }
  } catch (error) {
    console.error("Error exporting as PDF:", error)
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

/**
 * Create a PDF from an array of image data URLs
 */
async function createPDFFromImages(imageDataUrls: string[]): Promise<Blob> {
  // Create a hidden iframe to use for PDF generation
  const iframe = document.createElement("iframe")
  iframe.style.display = "none"
  document.body.appendChild(iframe)

  // Get the iframe document
  const doc = iframe.contentDocument || iframe.contentWindow?.document
  if (!doc) {
    document.body.removeChild(iframe)
    throw new Error("Could not access iframe document")
  }

  // Create HTML content for the PDF
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @page {
          margin: 0;
          size: 8.5in 11in;
        }
        body { 
          margin: 0; 
          padding: 0; 
          font-family: Arial, sans-serif;
        }
        .page { 
          page-break-after: always; 
          width: 100%; 
          height: 100%;
          position: relative;
        }
        .page:last-child { 
          page-break-after: avoid; 
        }
        img { 
          width: 100%; 
          height: auto; 
          display: block; 
        }
      </style>
    </head>
    <body>
  `

  // Add each page as an image
  imageDataUrls.forEach((dataUrl, index) => {
    const isLastPage = index === imageDataUrls.length - 1
    htmlContent += `
      <div class="page${isLastPage ? " last-page" : ""}">
        <img src="${dataUrl}" alt="Page ${index + 1}" />
      </div>
    `
  })

  htmlContent += `
    </body>
    </html>
  `

  // Write the HTML to the iframe
  doc.open()
  doc.write(htmlContent)
  doc.close()

  // Wait for images to load
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Use browser print to PDF functionality
  const printWindow = iframe.contentWindow
  if (!printWindow) {
    document.body.removeChild(iframe)
    throw new Error("Could not access iframe window")
  }

  // Create a promise that resolves when the PDF is generated
  return new Promise((resolve, reject) => {
    try {
      // Set up print options
      const printOptions = {
        margin: {
          top: "0",
          right: "0",
          bottom: "0",
          left: "0",
        },
        filename: "chat-export.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "pt", format: "letter", orientation: "portrait" },
      }

      // Use html2pdf.js-like approach with native browser printing
      printWindow.print = () => {
        // Create a blob from the HTML content
        const htmlBlob = new Blob([htmlContent], { type: "text/html" })

        // Resolve with the HTML blob (browser will convert to PDF when downloading)
        resolve(htmlBlob)

        // Clean up
        document.body.removeChild(iframe)
      }

      // Trigger print
      printWindow.print()
    } catch (error) {
      document.body.removeChild(iframe)
      reject(error)
    }
  })
}

/**
 * Format a string to be used as a filename
 */
function formatFileName(name: string): string {
  // Replace spaces and special characters with underscores
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "_")
    .replace(/^-+|-+$/g, "")
}

/**
 * Export chat history with pagination for large conversations
 */
export async function exportLargeChat(
  messages: ExportableMessage[],
  format: "text" | "markdown" | "json" | "pdf",
  title = "Chat Conversation",
  options: {
    batchSize?: number
    onProgress?: (progress: number) => void
  } = {},
): Promise<{ success: boolean; error?: Error }> {
  const { batchSize = 100, onProgress } = options

  try {
    // For large chats, process in batches
    if (messages.length > batchSize) {
      const totalBatches = Math.ceil(messages.length / batchSize)
      let processedMessages: ExportableMessage[] = []

      for (let i = 0; i < totalBatches; i++) {
        const start = i * batchSize
        const end = Math.min(start + batchSize, messages.length)
        const batch = messages.slice(start, end)

        processedMessages = [...processedMessages, ...batch]

        // Report progress
        if (onProgress) {
          onProgress(((i + 1) / totalBatches) * 100)
        }

        // Allow UI to update by yielding execution
        await new Promise((resolve) => setTimeout(resolve, 0))
      }

      messages = processedMessages
    }

    // Export based on selected format
    switch (format) {
      case "text":
        exportAsText(messages, title)
        return { success: true }
      case "markdown":
        exportAsMarkdown(messages, title)
        return { success: true }
      case "json":
        exportAsJSON(messages, title)
        return { success: true }
      case "pdf":
        return await exportAsPDF(messages, title)
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  } catch (error) {
    console.error(`Error exporting large chat as ${format}:`, error)
    return { success: false, error: error instanceof Error ? error : new Error(String(error)) }
  }
}

/**
 * Filter messages by date range
 */
export function filterMessagesByDateRange(
  messages: ExportableMessage[],
  startDate?: Date,
  endDate?: Date,
): ExportableMessage[] {
  if (!startDate && !endDate) return messages

  return messages.filter((message) => {
    const timestamp = message.timestamp || 0

    if (startDate && timestamp < startDate.getTime()) return false
    if (endDate && timestamp > endDate.getTime()) return false

    return true
  })
}
