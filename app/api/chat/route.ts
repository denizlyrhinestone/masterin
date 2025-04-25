import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { GROQ_API_KEY } from "@/lib/env-config"
import { rateLimit } from "@/lib/rate-limit"

// Set a reasonable timeout
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    // Apply rate limiting - 20 requests per minute
    const rateLimitResult = await rateLimit.check(req, 20, "1m")

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } },
      )
    }

    // Rest of the existing code...
    // Parse request body
    let body
    try {
      body = await req.json()
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    if (!body || !body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
    }

    const { messages, conversationId: existingConversationId } = body
    const conversationId = existingConversationId || `conv-${uuidv4()}`

    // Get the latest user message
    const latestUserMessage = messages.filter((m) => m.role === "user").pop()
    if (!latestUserMessage) {
      return NextResponse.json({ error: "No user message found" }, { status: 400 })
    }

    // Check if Groq API key is available
    if (!GROQ_API_KEY) {
      console.log("Groq API key not available, using fallback response")
      return generateFallbackResponse(latestUserMessage.content, conversationId)
    }

    try {
      // Make a direct fetch to Groq API instead of using the SDK
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "system",
              content: "You are a helpful AI assistant for Masterin, an AI-powered education platform.",
            },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
          max_tokens: 800,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        console.error(`Groq API error: ${response.status} ${response.statusText}`)

        // Try to get error details
        let errorDetails = ""
        try {
          const errorData = await response.json()
          errorDetails = JSON.stringify(errorData)
        } catch (e) {
          errorDetails = await response.text()
        }

        console.error("Error details:", errorDetails)

        // Use fallback response on error
        return generateFallbackResponse(latestUserMessage.content, conversationId)
      }

      // Parse the response
      const data = await response.json()
      const assistantMessage = data.choices?.[0]?.message?.content || "I'm not sure how to respond to that."

      // Return a simple JSON response
      return NextResponse.json(
        { text: assistantMessage, conversationId },
        { headers: { "x-conversation-id": conversationId } },
      )
    } catch (groqError) {
      console.error("Groq API error:", groqError)

      // Use fallback response on error
      return generateFallbackResponse(latestUserMessage.content, conversationId)
    }
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "An unexpected error occurred", details: String(error) }, { status: 500 })
  }
}

// Helper function to generate a fallback response
function generateFallbackResponse(userMessage, conversationId) {
  console.log("Using fallback response for:", userMessage.substring(0, 50))

  // Generate a simple response based on the user's message
  let responseContent = "I'm here to help with your questions about our platform. What would you like to know?"

  const lowerMessage = userMessage.toLowerCase()

  if (lowerMessage.includes("pricing") || lowerMessage.includes("cost")) {
    responseContent =
      "Masterin offers several pricing plans to fit different needs. We have a Free Trial, Premium plan at $9.99/month, and Team plan at $29.99/month."
  } else if (lowerMessage.includes("feature") || lowerMessage.includes("tool")) {
    responseContent =
      "Masterin offers several AI-powered learning tools including an AI Tutor for personalized explanations, Essay Assistant for writing help, and Math Problem Solver."
  } else if (lowerMessage.includes("subject") || lowerMessage.includes("learn")) {
    responseContent =
      "We cover a wide range of subjects including Mathematics, Science, Computer Science, and Humanities. Our AI tutor can help with questions in any of these areas."
  } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    responseContent = "Hello! I'm your AI assistant from Masterin. How can I help you today?"
  }

  return NextResponse.json(
    { text: responseContent, conversationId },
    { headers: { "x-conversation-id": conversationId } },
  )
}
