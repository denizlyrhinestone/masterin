import { NextResponse } from "next/server"
import { generateText } from "ai"
import { selectAIModel, updateServiceHealth } from "@/lib/ai-utils"
import { logError, ErrorCodes, getUserFriendlyErrorMessage } from "@/lib/error-handling"

// Simple system prompt
const SYSTEM_PROMPT = `You are an educational AI tutor. Your goal is to help students learn and understand concepts across various subjects. 
Be friendly, encouraging, and explain concepts in a clear, concise manner.
When appropriate, break down complex topics into simpler parts.
If you don't know something, admit it rather than making up information.`

// Define the system prompts for different subjects
const subjectPrompts = {
  general: SYSTEM_PROMPT,
  math: `You are a mathematics tutor. Explain mathematical concepts clearly and provide step-by-step solutions to problems.`,
  science: `You are a science tutor specializing in physics, chemistry, biology, and earth sciences.`,
  language: `You are a language arts tutor specializing in reading comprehension, writing, grammar, and literature analysis.`,
  history: `You are a history tutor. Present historical events with context and multiple perspectives.`,
  "computer-science": `You are a computer science tutor. Explain programming concepts, algorithms, data structures, and computer systems.`,
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { message, subject = "general", history = [], healthCheck = false, sessionId } = body

    // Validate inputs
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          error: "Invalid message format",
          success: false,
        },
        { status: 400 },
      )
    }

    // Select the best available AI model
    const { model, provider } = selectAIModel()

    // If no model is available, return a simple message
    if (!model) {
      return NextResponse.json({
        response: "I'm currently experiencing some technical difficulties. Please try again in a moment.",
        success: true,
        fallback: true,
        provider: "none",
        errorCode: ErrorCodes.CONN_SERVICE_UNAVAILABLE,
      })
    }

    // Get the appropriate system prompt
    const systemPrompt = subjectPrompts[subject] || subjectPrompts.general

    // Format the conversation history
    const formattedHistory = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Track consecutive errors for this session
    const consecutiveErrors = 0

    try {
      // Generate response using AI SDK
      const response = await generateText({
        model: model,
        system: systemPrompt,
        messages: [...formattedHistory, { role: "user", content: message }],
        temperature: 0.7,
        maxTokens: 1000,
      })

      // Update service health to operational
      updateServiceHealth(provider, "available")

      // Return the AI response
      return NextResponse.json({
        response: response.text,
        success: true,
        provider: provider,
      })
    } catch (aiError) {
      console.error("AI generation error:", aiError)

      // Log the error
      const errorLog = logError(
        aiError instanceof Error ? aiError : String(aiError),
        "AITutor.generateText",
        {
          subject,
          provider,
          sessionId,
        },
        undefined,
        sessionId,
      )

      // Update service health
      updateServiceHealth(
        provider,
        "unavailable",
        undefined,
        aiError instanceof Error ? aiError : new Error(String(aiError)),
      )

      // Create diagnostics for debugging
      const diagnostics = {
        errorType: aiError instanceof Error ? aiError.constructor.name : "Unknown",
        errorMessage: aiError.message || "No message available",
        provider,
        consecutiveErrors,
        recommendation: consecutiveErrors > 2 ? "Consider switching to a different AI provider" : "Retry your request",
        userMessage: getUserFriendlyErrorMessage(errorLog.errorCode),
      }

      // Return a simple fallback response
      return NextResponse.json({
        response: "I'm having trouble processing your request right now. Could you try asking a simpler question?",
        success: true,
        fallback: true,
        provider: provider,
        errorCode: errorLog.errorCode,
        errorCategory: errorLog.category,
        diagnostics,
      })
    }
  } catch (error) {
    console.error("Error in AI tutor API:", error)

    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        success: false,
      },
      { status: 500 },
    )
  }
}
