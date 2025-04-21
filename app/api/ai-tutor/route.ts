import { NextResponse } from "next/server"
import { generateText } from "ai"
import { selectAIModel, generateFallbackResponse } from "@/lib/ai-utils"
import { isValidOpenAIKey, testOpenAIKey } from "@/lib/api-key-validator"

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

// Track API key validation status
let openAIKeyValidated = false
let openAIKeyError: string | null = null

// In-memory request tracking for diagnostics
const requestLog: {
  timestamp: Date
  subject: string
  success: boolean
  provider?: string
  error?: string
  responseTime?: number
}[] = []

export async function POST(request: Request) {
  const startTime = Date.now()
  const requestEntry = {
    timestamp: new Date(),
    subject: "unknown",
    success: false,
  }

  try {
    // Parse the request body
    const body = await request.json()
    const { message, subject = "general", history = [] } = body

    requestEntry.subject = subject

    // Validate inputs
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message format", success: false }, { status: 400 })
    }

    console.log(`AI Tutor request received - Subject: ${subject}`)

    // Validate OpenAI API key if not already validated
    const openaiKey = process.env.OPENAI_API_KEY
    if (openaiKey && !openAIKeyValidated && !openAIKeyError) {
      if (!isValidOpenAIKey(openaiKey)) {
        openAIKeyError = "Invalid OpenAI API key format"
        console.error(openAIKeyError)
      } else {
        try {
          console.log("Validating OpenAI API key...")
          const keyTest = await testOpenAIKey(openaiKey)
          if (keyTest.valid) {
            openAIKeyValidated = true
            console.log("OpenAI API key validated successfully")
          } else {
            openAIKeyError = keyTest.error || "Unknown API key validation error"
            console.error("OpenAI API key validation failed:", openAIKeyError)
          }
        } catch (error: any) {
          openAIKeyError = error.message || "Error validating OpenAI API key"
          console.error(openAIKeyError)
        }
      }
    }

    // Get the appropriate system prompt based on the selected subject
    const systemPrompt = subjectPrompts[subject] || subjectPrompts.general

    // Format the conversation history for the AI
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Select the best available AI model
    const { model, provider } = await selectAIModel()

    // If we don't have a model available, use fallback response
    if (provider === "fallback" || !model) {
      console.log("No AI model available, using fallback response")
      const fallbackResponse = generateFallbackResponse(subject, message)

      requestEntry.success = true
      requestEntry.provider = "fallback"
      requestEntry.responseTime = Date.now() - startTime
      requestLog.push(requestEntry)

      // Keep only the last 100 requests
      if (requestLog.length > 100) requestLog.shift()

      return NextResponse.json({
        response: fallbackResponse,
        success: true,
        fallback: true,
        provider: "fallback",
        diagnostics: {
          openAIKeyValidated,
          openAIKeyError,
          requestCount: requestLog.length,
          successRate: calculateSuccessRate(),
        },
        timestamp: new Date().toISOString(),
      })
    }

    try {
      console.log(`Generating response using ${provider} model...`)

      // Create a timeout for the request
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      // Generate response using AI SDK with proper error handling
      const response = await generateText({
        model: model,
        system: systemPrompt,
        messages: [...formattedHistory, { role: "user", content: message }],
        temperature: 0.7, // Add some variability to responses
        maxTokens: 1000, // Limit response length
      })

      // Clear the timeout
      clearTimeout(timeoutId)

      console.log(`AI Tutor response generated successfully using ${provider}`)

      requestEntry.success = true
      requestEntry.provider = provider
      requestEntry.responseTime = Date.now() - startTime
      requestLog.push(requestEntry)

      // Keep only the last 100 requests
      if (requestLog.length > 100) requestLog.shift()

      // Return the AI response
      return NextResponse.json({
        response: response.text,
        success: true,
        provider: provider,
        diagnostics: {
          openAIKeyValidated,
          requestCount: requestLog.length,
          successRate: calculateSuccessRate(),
          responseTime: Date.now() - startTime,
        },
        timestamp: new Date().toISOString(),
      })
    } catch (aiError: any) {
      console.error(`${provider} AI SDK Error:`, aiError)

      requestEntry.success = false
      requestEntry.provider = provider
      requestEntry.error = aiError.message
      requestEntry.responseTime = Date.now() - startTime
      requestLog.push(requestEntry)

      // Detailed error logging for diagnosis
      const errorDetails = {
        message: aiError.message,
        stack: aiError.stack,
        provider,
        timestamp: new Date().toISOString(),
      }

      console.error("AI Error Details:", JSON.stringify(errorDetails, null, 2))

      // Create a fallback response for common AI service issues
      const fallbackResponse =
        "I'm currently experiencing some technical difficulties. Let me try a simpler approach to help you. What specific question do you have about this subject?"

      // Return a fallback response with partial success
      return NextResponse.json({
        response: fallbackResponse,
        success: true, // Mark as success to prevent error display
        fallback: true,
        provider: provider,
        error: aiError.message,
        diagnostics: {
          openAIKeyValidated,
          openAIKeyError,
          errorType: aiError.name,
          errorMessage: aiError.message,
          requestCount: requestLog.length,
          successRate: calculateSuccessRate(),
        },
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error: any) {
    console.error("Error in AI tutor API:", error)

    requestEntry.success = false
    requestEntry.error = error.message
    requestEntry.responseTime = Date.now() - startTime
    requestLog.push(requestEntry)

    // Determine the appropriate error message and status code
    let errorMessage = "Failed to process your request"
    let statusCode = 500

    if (error.code === "ECONNRESET" || error.code === "ETIMEDOUT") {
      errorMessage = "Connection to AI service failed. Please try again later."
      statusCode = 503 // Service Unavailable
    } else if (error.message?.includes("rate limit")) {
      errorMessage = "AI service rate limit exceeded. Please try again in a few moments."
      statusCode = 429 // Too Many Requests
    } else if (error.name === "AbortError") {
      errorMessage = "Request timed out. Please try again with a simpler question."
      statusCode = 408 // Request Timeout
    }

    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
        errorCode: statusCode,
        diagnostics: {
          openAIKeyValidated,
          openAIKeyError,
          errorType: error.name,
          errorMessage: error.message,
          requestCount: requestLog.length,
          successRate: calculateSuccessRate(),
        },
        timestamp: new Date().toISOString(),
      },
      { status: statusCode },
    )
  }
}

// Calculate success rate from request log
function calculateSuccessRate(): number {
  if (requestLog.length === 0) return 0
  const successfulRequests = requestLog.filter((req) => req.success).length
  return Math.round((successfulRequests / requestLog.length) * 100)
}

// Endpoint to get diagnostic information
export async function GET() {
  return NextResponse.json({
    status: "operational",
    openAIKeyValidated,
    openAIKeyError,
    requestCount: requestLog.length,
    successRate: calculateSuccessRate(),
    recentRequests: requestLog.slice(-10).map((req) => ({
      timestamp: req.timestamp,
      subject: req.subject,
      success: req.success,
      provider: req.provider,
      responseTime: req.responseTime,
    })),
    timestamp: new Date().toISOString(),
  })
}
