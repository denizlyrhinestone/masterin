import { NextResponse } from "next/server"
import { generateText } from "ai"
import { selectAIModel, generateFallbackResponse } from "@/lib/ai-utils"

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
const ERROR_THRESHOLD = 5
const ERROR_COOLDOWN_MS = 60000 // 1 minute cooldown after consecutive errors

// Mock functions for performAIDiagnostics and updateServiceHealth
// Replace these with your actual implementations
async function performAIDiagnostics() {
  return {
    status: "ok",
    message: "All systems nominal (mock).",
  }
}

function updateServiceHealth(provider: string, status: string, responseTime?: number, error?: any) {
  console.log(
    `[Health] Provider: ${provider}, Status: ${status}, Response Time: ${responseTime}ms, Error: ${error ? error.message : "None"}`,
  )
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { message, subject = "general", history = [], healthCheck = false } = body

    // Validate inputs
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message format", success: false }, { status: 400 })
    }

    console.log(
      `AI Tutor request received - Subject: ${subject}, Message length: ${message.length}, Health check: ${healthCheck}`,
    )

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

      // Perform diagnostics to provide better error information
      const diagnostics = await performAIDiagnostics()

      const fallbackResponse = generateFallbackResponse(subject, message)

      return NextResponse.json({
        response: fallbackResponse,
        success: true,
        fallback: true,
        provider: "fallback",
        timestamp: new Date().toISOString(),
        diagnostics: diagnostics,
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

    try {
      // Start time for performance monitoring
      const startTime = Date.now()

      // For health checks, attempt a simpler prompt for quick response
      const promptContent = healthCheck
        ? "This is a health check. Please respond with 'operational' if you can process requests."
        : message

      // Log request sent to the AI provider for debugging
      console.log(`Sending request to ${provider} with model: ${model}`)

      // Generate response using AI SDK with proper error handling
      const response = await generateText({
        model: model,
        system: systemPrompt,
        messages: [...formattedHistory, { role: "user", content: promptContent }],
        temperature: 0.7, // Add some variability to responses
        maxTokens: healthCheck ? 50 : 1000, // Shorter for health checks
      })

      // Calculate response time for monitoring
      const responseTime = Date.now() - startTime
      console.log(`AI Tutor response generated successfully using ${provider} in ${responseTime}ms`)

      // Reset error tracking
      lastSuccessfulCall = Date.now()
      consecutiveErrors = 0

      // Update service health status
      updateServiceHealth(provider, "available", responseTime)

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

      // Detailed error logging for troubleshooting
      console.error(`${provider} AI SDK Error (${consecutiveErrors}/${ERROR_THRESHOLD}):`, aiError)
      console.error(
        `Error details: ${JSON.stringify({
          message: aiError.message,
          name: aiError.name,
          stack: aiError.stack?.split("\n")[0],
          provider,
        })}`,
      )

      // Update service health to reflect the error
      updateServiceHealth(provider, "unavailable", undefined, aiError)

      // Generate a more specific fallback response based on error type
      let fallbackResponse = ""
      let errorCode = "GENERAL_ERROR"
      let errorDetails = null

      if (aiError.message?.includes("rate limit") || aiError.message?.includes("429")) {
        fallbackResponse = "I'm receiving too many questions right now. Can you try again in a moment?"
        errorCode = "RATE_LIMITED"
      } else if (aiError.message?.includes("timeout") || aiError.message?.includes("ETIMEDOUT")) {
        fallbackResponse =
          "It's taking me longer than expected to process your question. Let me try a simpler approach. What specific part of this subject are you interested in?"
        errorCode = "TIMEOUT"
      } else if (aiError.message?.includes("context length") || aiError.message?.includes("token limit")) {
        fallbackResponse =
          "Your question and our conversation history have become quite lengthy. Could you ask a more focused question?"
        errorCode = "CONTEXT_LENGTH_EXCEEDED"
      } else if (aiError.message?.includes("authentication") || aiError.message?.includes("invalid key")) {
        fallbackResponse =
          "I'm having trouble authenticating with my knowledge source. Let me help with what I know. What specific concept would you like me to explain?"
        errorCode = "AUTHENTICATION_ERROR"
        errorDetails = "API key validation failed"
      } else if (aiError.message?.includes("unavailable") || aiError.message?.includes("connecting")) {
        fallbackResponse =
          "I'm temporarily unable to connect to my advanced knowledge base. Let me help with a simpler explanation instead. What topic would you like to know about?"
        errorCode = "CONNECTION_ERROR"
      } else {
        fallbackResponse =
          "I'm temporarily having trouble accessing my advanced tutoring capabilities. Let me help with a simpler explanation instead. What specific concept would you like me to clarify?"
      }

      // Create diagnostic information for troubleshooting
      const diagnosticInfo = {
        errorType: aiError.name || "Unknown",
        errorMessage: aiError.message || "No message available",
        provider: provider,
        consecutiveErrors,
        recommendation: consecutiveErrors > 2 ? "Consider switching to a different AI provider" : "Retry your request",
      }

      // Return a more informative fallback response
      return NextResponse.json({
        response: fallbackResponse,
        success: true, // Mark as success to prevent frontend error display
        fallback: true,
        provider: provider,
        error: aiError.message,
        errorCode,
        errorDetails,
        consecutiveErrors,
        diagnostics: diagnosticInfo,
        timestamp: new Date().toISOString(),
      })
    }
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
