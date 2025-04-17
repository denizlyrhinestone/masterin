import { streamText } from "ai"
import { xai } from "@ai-sdk/xai"
import { logger } from "../logger"

// Check if XAI is properly configured
export function isConfigured(): boolean {
  return !!process.env.XAI_API_KEY && process.env.XAI_API_KEY.length > 10
}

// Generate a response using XAI
export async function generateResponse(
  messages: any[],
  options: any = {},
): Promise<{
  content: string
  metadata?: any
  error?: string
}> {
  try {
    const { text, usage } = await streamText.generate({
      model: xai("grok-1"),
      system: options.system || "You are a helpful educational assistant.",
      messages,
    })

    return {
      content: text,
      metadata: { usage },
    }
  } catch (error: any) {
    logger.error("XAI generation error", { error, messages: messages.length })

    return {
      content: "I'm sorry, I encountered an error while processing your request.",
      error: error.message || "UNKNOWN_ERROR",
    }
  }
}

// Stream a response using XAI
export function streamResponse(messages: any[], options: any = {}): Response {
  try {
    logger.debug("Streaming response with XAI", { messageCount: messages.length })

    const apiKey = process.env.XAI_API_KEY
    if (!apiKey) {
      logger.error("XAI API key not configured")
      return createErrorStream("AI service not properly configured")
    }

    // Create a stream from the XAI API
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Prepare the request payload
          const payload = {
            messages: [
              // Add system message if provided
              ...(options?.system ? [{ role: "system", content: options.system }] : []),
              // Add user messages
              ...messages,
            ],
            model: "grok-1",
            temperature: 0.7,
            max_tokens: 1000,
            stream: true,
          }

          // Make the API request
          const response = await fetch("https://api.xai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload),
          })

          // Handle API errors
          if (!response.ok) {
            const errorText = await response.text()
            logger.error("XAI API streaming error", { status: response.status, error: errorText })
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: `API error: ${response.status}` })}\n\n`),
            )
            controller.close()
            return
          }

          // Process the streaming response
          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error("Failed to get response reader")
          }

          const decoder = new TextDecoder()
          let buffer = ""

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            // Decode the chunk and add it to the buffer
            buffer += decoder.decode(value, { stream: true })

            // Process complete lines in the buffer
            const lines = buffer.split("\n")
            buffer = lines.pop() || ""

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                if (data === "[DONE]") continue

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content || ""
                  if (content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: content })}\n\n`))
                  }
                } catch (e) {
                  logger.error("Error parsing streaming response", { error: e, line })
                }
              }
            }
          }

          controller.close()
        } catch (error) {
          const err = error as Error
          logger.error("Error in XAI streaming", { error: err.message, stack: err.stack })
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Streaming error occurred" })}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    return createErrorStream("Failed to initialize stream")
  }
}

// Add this helper function for creating error streams
function createErrorStream(errorMessage: string): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
