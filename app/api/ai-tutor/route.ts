import { NextResponse } from "next/server"
import { generateText } from "ai"
import { selectAIModel, generateFallbackResponse, updateServiceHealth, checkProviderHealth } from "@/lib/ai-utils"

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

// Track API health status
let lastSuccessfulCall = Date.now()
let consecutiveErrors = 0
const ERROR_THRESHOLD = 3
const ERROR_COOLDOWN_MS = 60000 // 1 minute cooldown after consecutive errors
const MAX_RETRIES = 2

// Initialize provider health checks on first load
let healthChecksInitialized = false

export async function POST(request: Request) {
  // Run initial health checks if not done yet
  if (!healthChecksInitialized) {
    initializeHealthChecks()
    healthChecksInitialized = true
  }

  try {
    // Parse the request body
    const body = await request.json()
    const { message, subject = "general", history = [], healthCheck = false } = body

    // Handle health check requests differently
    if (healthCheck) {
      return handleHealthCheck()
    }

    // Validate inputs
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message format", success: false }, { status: 400 })
    }

    console.log(`AI Tutor request received - Subject: ${subject}, Message length: ${message.length}`)

    // Get the appropriate system prompt based on the selected subject
    const systemPrompt = subjectPrompts[subject] || subjectPrompts.general

    // Format the conversation history for the AI
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Select the best available AI model
    const { model, provider } = selectAIModel()

    // If we don't have a model available, use fallback response
    if (provider === "fallback" || !model) {
      console.log("No AI model available, using fallback response")
      const fallbackResponse = generateFallbackResponse(subject, message)

      return NextResponse.json({
        response: fallbackResponse,
        success: true,
        fallback: true,
        provider: "fallback",
        errorCode: "NO_MODEL_AVAILABLE",
        timestamp: new Date().toISOString(),
      })
    }

    // Check if we're in the error threshold cooldown period
    const timeSinceLastSuccess = Date.now() - lastSuccessfulCall
    if (consecutiveErrors >= ERROR_THRESHOLD && timeSinceLastSuccess < ERROR_COOLDOWN_MS) {
      console.log(`AI service in cooldown period after ${consecutiveErrors} consecutive errors`)
      const fallbackResponse = generateFallbackResponse(subject, message)

      return NextResponse.json({
        response: fallbackResponse,
        success: true,
        fallback: true,
        provider: "cooldown",
        errorCode: "SERVICE_COOLDOWN",
        timestamp: new Date().toISOString(),
      })
    }

    // Try to generate a response with retries for transient errors
    return await generateAIResponse(model, provider, systemPrompt, formattedHistory, message, subject)
  } catch (error: any) {
    console.error("Error in AI tutor API:", error)

    // Determine the appropriate error message and status code
    let errorMessage = "Failed to process your request"
    let statusCode = 500
    let errorCode = "SERVER_ERROR"

    if (error.code === "ECONNRESET" || error.code === "ETIMEDOUT") {
      errorMessage = "Connection to AI service failed. Please try again later."
      statusCode = 503 // Service Unavailable
      errorCode = "CONNECTION_FAILED"
    } else if (error.message?.includes("rate limit")) {
      errorMessage = "AI service rate limit exceeded. Please try again in a few moments."
      statusCode = 429 // Too Many Requests
      errorCode = "RATE_LIMITED"
    } else if (error.message?.includes("parse") || error instanceof SyntaxError) {
      errorMessage = "Invalid request format. Please check your input."
      statusCode = 400 // Bad Request
      errorCode = "INVALID_REQUEST"
    }

    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
        errorCode,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode },
    )
  }
}

/**
 * Initialize health checks for all providers
 */
async function initializeHealthChecks() {
  console.log("Initializing AI provider health checks...")

  // Check OpenAI
  if (process.env.OPENAI_API_KEY) {
    checkProviderHealth("openai")
      .then((available) => console.log(`OpenAI health check: ${available ? "Available" : "Unavailable"}`))
      .catch((err) => console.error("OpenAI health check error:", err))
  }

  // Check Groq
  if (process.env.GROQ_API_KEY) {
    checkProviderHealth("groq")
      .then((available) => console.log(`Groq health check: ${available ? "Available" : "Unavailable"}`))
      .catch((err) => console.error("Groq health check error:", err))
  }

  // Check XAI
  if (process.env.XAI_API_KEY) {
    checkProviderHealth("xai")
      .then((available) => console.log(`XAI health check: ${available ? "Available" : "Unavailable"}`))
      .catch((err) => console.error("XAI health check error:", err))
  }
}

/**
 * Handle health check requests
 */
async function handleHealthCheck() {
  const { model, provider } = selectAIModel()

  return NextResponse.json({
    status: "operational",
    provider: provider,
    hasModel: model !== null,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Generate AI response with retry logic for transient errors
 */
async function generateAIResponse(
  model: any,
  provider: string,
  systemPrompt: string,
  history: any[],
  message: string,
  subject: string,
  retryCount = 0,
) {
  try {
    // Start time for performance monitoring
    const startTime = Date.now()

    // Generate response using AI SDK with proper error handling
    const response = await generateText({
      model: model,
      system: systemPrompt,
      messages: [...history, { role: "user", content: message }],
      temperature: 0.7, // Add some variability to responses
      maxTokens: 1000, // Limit response length
    })

    // Calculate response time for monitoring
    const responseTime = Date.now() - startTime
    console.log(`AI Tutor response generated successfully using ${provider} in ${responseTime}ms`)

    // Update service health
    updateServiceHealth(provider as any, "available", responseTime)

    // Reset error tracking
    lastSuccessfulCall = Date.now()
    consecutiveErrors = 0

    // Return the AI response
    return NextResponse.json({
      response: response.text,
      success: true,
      provider: provider,
      responseTime,
      timestamp: new Date().toISOString(),
    })
  } catch (aiError: any) {
    // Increment consecutive error count
    consecutiveErrors++

    console.error(`${provider} AI SDK Error (${consecutiveErrors}/${ERROR_THRESHOLD}):`, aiError)

    // Update service health
    updateServiceHealth(provider as any, "unavailable", undefined, aiError)

    // Retry for transient errors if we haven't exceeded max retries
    if (retryCount < MAX_RETRIES && isTransientError(aiError)) {
      console.log(`Retrying AI request (attempt ${retryCount + 1}/${MAX_RETRIES})...`)

      // Exponential backoff: wait longer between each retry
      const backoffMs = Math.pow(2, retryCount) * 500
      await new Promise((resolve) => setTimeout(resolve, backoffMs))

      // Try a different provider if available
      const { model: newModel, provider: newProvider } = selectAIModel()

      if (newModel && newProvider !== "fallback") {
        return generateAIResponse(newModel, newProvider, systemPrompt, history, message, subject, retryCount + 1)
      }
    }

    // Generate a more specific fallback response based on error type
    const { fallbackResponse, errorCode } = generateErrorResponse(aiError, subject, message)

    // Return a more informative fallback response
    return NextResponse.json({
      response: fallbackResponse,
      success: true, // Mark as success to prevent frontend error display
      fallback: true,
      provider: provider,
      error: aiError.message,
      errorCode,
      consecutiveErrors,
      timestamp: new Date().toISOString(),
    })
  }
}

/**
 * Check if an error is likely transient and worth retrying
 */
function isTransientError(error: any): boolean {
  const errorMsg = error.message?.toLowerCase() || ""

  return (
    errorMsg.includes("timeout") ||
    errorMsg.includes("etimedout") ||
    errorMsg.includes("econnreset") ||
    errorMsg.includes("network") ||
    errorMsg.includes("connection") ||
    errorMsg.includes("socket") ||
    errorMsg.includes("429") ||
    errorMsg.includes("rate limit") ||
    errorMsg.includes("too many requests") ||
    errorMsg.includes("server error") ||
    errorMsg.includes("503") ||
    errorMsg.includes("502")
  )
}

/**
 * Generate an appropriate error response based on the error type
 */
function generateErrorResponse(
  error: any,
  subject: string,
  message: string,
): { fallbackResponse: string; errorCode: string } {
  const errorMsg = error.message?.toLowerCase() || ""

  if (errorMsg.includes("rate limit") || errorMsg.includes("429") || errorMsg.includes("too many requests")) {
    return {
      fallbackResponse: "I'm receiving too many questions right now. Can you try again in a moment?",
      errorCode: "RATE_LIMITED",
    }
  }

  if (errorMsg.includes("timeout") || errorMsg.includes("etimedout")) {
    return {
      fallbackResponse:
        "It's taking me longer than expected to process your question. Let me try a simpler approach. What specific part of this subject are you interested in?",
      errorCode: "TIMEOUT",
    }
  }

  if (errorMsg.includes("context length") || errorMsg.includes("token limit")) {
    return {
      fallbackResponse:
        "Your question and our conversation history have become quite lengthy. Could you ask a more focused question?",
      errorCode: "CONTEXT_LENGTH_EXCEEDED",
    }
  }

  if (errorMsg.includes("invalid") && errorMsg.includes("key")) {
    return {
      fallbackResponse:
        "I'm experiencing a configuration issue. While our team fixes this, could you tell me what specific topic you'd like to learn about?",
      errorCode: "INVALID_API_KEY",
    }
  }

  // Default fallback for unknown errors
  return {
    fallbackResponse:
      "I'm temporarily having trouble accessing my advanced tutoring capabilities. Let me help with a simpler explanation instead. What specific concept would you like me to clarify?",
    errorCode: "GENERAL_ERROR",
  }
}
