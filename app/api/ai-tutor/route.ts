import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Define the system prompts for different subjects
const subjectPrompts: Record<string, string> = {
  general: `You are an educational AI tutor named Masterin Tutor. Your goal is to help students learn and understand concepts across various subjects. 
  Be friendly, encouraging, and explain concepts in a clear, concise manner. 
  When appropriate, break down complex topics into simpler parts. 
  If you don't know something, admit it rather than making up information.`,

  math: `You are a mathematics tutor specializing in mathematics. Explain mathematical concepts clearly and provide step-by-step solutions to problems. 
  Use examples to illustrate concepts and encourage understanding rather than memorization. 
  For complex problems, break down the solution process into clear steps.
  When appropriate, suggest related concepts that might help deepen understanding.`,

  science: `You are a science tutor specializing in physics, chemistry, biology, and earth sciences. 
  Explain scientific concepts using clear language and real-world examples. 
  When discussing theories or models, explain the evidence supporting them.
  Help students understand the scientific method and how to apply it.`,

  language: `You are a language arts tutor specializing in reading comprehension, writing, grammar, and literature analysis. 
  Help students improve their writing skills, understand literary devices, and analyze texts.
  Provide constructive feedback on writing and suggest ways to improve clarity, structure, and style.`,

  history: `You are a history tutor. Present historical events with context and multiple perspectives.
  Help students understand cause and effect relationships in history and how to analyze primary and secondary sources.
  Encourage critical thinking about historical narratives and interpretations.`,

  "computer-science": `You are a computer science tutor. Explain programming concepts, algorithms, data structures, and computer systems.
  Provide code examples when helpful and explain how to approach problem-solving in computer science.
  Help debug code by identifying common errors and explaining best practices.`,
}

// Simple in-memory rate limiting
const rateLimits = new Map<string, { count: number; resetTime: number }>()
const MAX_REQUESTS_PER_MINUTE = 10
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute

function isRateLimited(clientId: string): boolean {
  const now = Date.now()
  const clientRateLimit = rateLimits.get(clientId)

  if (!clientRateLimit) {
    // First request from this client
    rateLimits.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  if (now > clientRateLimit.resetTime) {
    // Reset window has passed
    rateLimits.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  if (clientRateLimit.count >= MAX_REQUESTS_PER_MINUTE) {
    // Rate limit exceeded
    return true
  }

  // Increment request count
  clientRateLimit.count++
  return false
}

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "unknown"

    // Check rate limit
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later.", success: false },
        { status: 429 },
      )
    }

    // Parse the request body
    const body = await request.json()
    const { message, subject = "general", history = [] } = body

    // Validate inputs
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message format", success: false }, { status: 400 })
    }

    console.log(`AI Tutor request received - Subject: ${subject}`)

    // Get the appropriate system prompt based on the selected subject
    const systemPrompt = subjectPrompts[subject] || subjectPrompts.general

    // Format the conversation history for the AI
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Set up timeout for the request
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out")), 30000) // 30 second timeout
    })

    // Generate response using AI SDK with timeout
    const responsePromise = generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages: [...formattedHistory, { role: "user", content: message }],
      temperature: 0.7, // Add some variability to responses
      maxTokens: 1000, // Limit response length
    })

    // Race the response against the timeout
    const { text } = (await Promise.race([responsePromise, timeoutPromise])) as { text: string }

    console.log("AI Tutor response generated successfully")

    // Return the AI response
    return NextResponse.json({
      response: text,
      success: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Error in AI tutor API:", error)

    // Determine the appropriate error message and status code
    let errorMessage = "Failed to process your request"
    let statusCode = 500

    if (error.message === "Request timed out") {
      errorMessage = "The AI tutor is taking too long to respond. Please try again with a simpler question."
      statusCode = 408 // Request Timeout
    } else if (error.code === "ECONNRESET" || error.code === "ETIMEDOUT") {
      errorMessage = "Connection to AI service failed. Please try again later."
      statusCode = 503 // Service Unavailable
    } else if (error.message?.includes("rate limit")) {
      errorMessage = "AI service rate limit exceeded. Please try again in a few moments."
      statusCode = 429 // Too Many Requests
    }

    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
        errorCode: statusCode,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode },
    )
  }
}
