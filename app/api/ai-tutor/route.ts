import { NextResponse } from "next/server"
import { generateText } from "ai"
import { selectAIModel } from "@/lib/ai-utils"
import { logError, ErrorCodes, ErrorCategory, getUserFriendlyErrorMessage } from "@/lib/error-handling"
import { FallbackAnalyzer } from "@/lib/fallback-analyzer"
import { TieredFallbackStrategy } from "@/lib/tiered-fallback-strategy"
import { serviceHealthMonitor, ServiceType, ServiceStatus } from "@/lib/service-health"
import { errorMonitor } from "@/lib/error-monitoring"
import { featureFlags, FeatureType } from "@/lib/feature-flags"
import { ErrorSeverity } from "@/lib/error-monitoring"

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
  const startTime = Date.now()

  try {
    // Check if the AI Tutor feature is enabled
    if (!featureFlags.isFeatureEnabled(FeatureType.AI_TUTOR)) {
      // If fallback is available, use it
      if (featureFlags.shouldShowFallback(FeatureType.AI_TUTOR)) {
        return handleFallbackResponse("Feature temporarily unavailable", "general", "general", undefined, {
          errorCode: ErrorCodes.CONN_SERVICE_UNAVAILABLE,
          errorCategory: ErrorCategory.CONNECTIVITY,
        })
      }

      // Otherwise, return an error
      return NextResponse.json(
        {
          error: "AI Tutor is currently unavailable. Please try again later.",
          success: false,
          errorCode: ErrorCodes.CONN_SERVICE_UNAVAILABLE,
        },
        { status: 503 },
      )
    }

    // Parse the request body
    const body = await request.json()
    const { message, subject = "general", topic = "general", history = [], healthCheck = false, sessionId } = body

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

    // Get instances of fallback services
    const fallbackAnalyzer = FallbackAnalyzer.getInstance()
    const fallbackStrategy = TieredFallbackStrategy.getInstance()

    // Select the best available AI model
    const { model, provider } = selectAIModel()

    // Track consecutive errors for this session
    const consecutiveErrors = 0

    // If no model is available, return a fallback response
    if (!model) {
      return handleFallbackResponse("No AI models available", subject, topic, sessionId, {
        errorCode: ErrorCodes.CONN_SERVICE_UNAVAILABLE,
        errorCategory: ErrorCategory.CONNECTIVITY,
      })
    }

    // Get the appropriate system prompt
    const systemPrompt = subjectPrompts[subject] || subjectPrompts.general

    // Format the conversation history
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }))

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
      serviceHealthMonitor.updateServiceHealth(
        getServiceTypeFromProvider(provider),
        ServiceStatus.OPERATIONAL,
        Date.now() - startTime,
        "AI service responded successfully",
      )

      // Cache the successful response for potential future fallback
      fallbackStrategy.cacheResponse(subject, topic, message, response.text)

      // Return the AI response
      return NextResponse.json({
        response: response.text,
        success: true,
        provider: provider,
        responseTime: Date.now() - startTime,
      })
    } catch (aiError) {
      console.error("AI generation error:", aiError)

      // Update service health to degraded or outage
      serviceHealthMonitor.updateServiceHealth(
        getServiceTypeFromProvider(provider),
        ServiceStatus.DEGRADED,
        Date.now() - startTime,
        aiError instanceof Error ? aiError.message : String(aiError),
      )

      // Track the error in our monitoring system
      errorMonitor.trackError(
        aiError instanceof Error ? aiError : String(aiError),
        "AITutor.generateText",
        ErrorCategory.MODEL_ERROR,
        ErrorSeverity.ERROR,
        { subject, provider, sessionId },
      )

      // Return a fallback response
      return handleFallbackResponse(
        aiError instanceof Error ? aiError.message : String(aiError),
        subject,
        topic,
        sessionId,
      )
    }
  } catch (error) {
    console.error("Error in AI tutor API:", error)

    // Log the unexpected error
    errorMonitor.trackError(
      error instanceof Error ? error : String(error),
      "AITutor.unexpectedError",
      ErrorCategory.UNKNOWN,
      ErrorSeverity.ERROR,
    )

    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        success: false,
        fallback: true,
        response: "I'm sorry, but I encountered an unexpected error. Please try again or ask a different question.",
      },
      { status: 500 },
    )
  }
}

// Helper function to handle fallback responses
async function handleFallbackResponse(
  errorMessage: string,
  subject: string,
  topic: string,
  sessionId?: string,
  errorInfo?: {
    errorCode?: string
    errorCategory?: ErrorCategory
  },
): Promise<NextResponse> {
  // Get instances of fallback services
  const fallbackAnalyzer = FallbackAnalyzer.getInstance()
  const fallbackStrategy = TieredFallbackStrategy.getInstance()

  // Log the error
  const errorLog = logError(
    errorMessage,
    "AITutor.fallback",
    {
      subject,
      sessionId,
      errorCode: errorInfo?.errorCode,
      errorCategory: errorInfo?.errorCategory,
    },
    undefined,
    sessionId,
  )

  // Analyze the fallback
  const trigger = fallbackAnalyzer.analyzeFallback(errorMessage, errorInfo?.errorCode, errorInfo?.errorCategory)

  // Record the fallback incident
  const incident = fallbackAnalyzer.recordFallback(trigger, errorMessage, {
    errorCode: errorLog.errorCode,
    errorCategory: errorLog.category,
    subject,
    topic,
    query: subject,
    sessionId,
  })

  // Determine fallback tier
  const tier = fallbackStrategy.determineFallbackTier(0, undefined, trigger)

  // Get fallback content
  const fallbackContent = fallbackStrategy.getFallbackContent(subject, topic, {
    tier,
    trigger,
    errorCode: errorLog.errorCode,
    query: subject,
  })

  // Create diagnostics for debugging
  const diagnostics = {
    errorType: "AIServiceUnavailable",
    errorMessage: errorMessage,
    provider: "fallback",
    recommendation: "Try again later or ask a simpler question",
    userMessage: getUserFriendlyErrorMessage(errorLog.errorCode || ""),
    fallbackTier: tier,
    fallbackTrigger: trigger,
    fallbackContentType: fallbackContent.type,
  }

  // Return a fallback response
  return NextResponse.json({
    response: fallbackContent.content,
    success: true,
    fallback: true,
    provider: "fallback",
    errorCode: errorLog.errorCode,
    errorCategory: errorLog.category,
    fallbackTier: tier,
    fallbackTrigger: trigger,
    fallbackContentType: fallbackContent.type,
    diagnostics,
  })
}

// Helper function to convert provider to ServiceType
function getServiceTypeFromProvider(provider: string): ServiceType {
  switch (provider) {
    case "openai":
      return ServiceType.OPENAI
    case "groq":
      return ServiceType.GROQ
    case "xai":
      return ServiceType.XAI
    default:
      return ServiceType.OPENAI
  }
}
