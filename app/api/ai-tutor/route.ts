import { NextResponse } from "next/server"
import { generateText } from "ai"
import { selectAIModel, updateServiceHealth, generateFallbackResponse } from "@/lib/ai-utils"
import { logError, ErrorCodes, ErrorCategory, getUserFriendlyErrorMessage } from "@/lib/error-handling"
import { FallbackAnalyzer } from "@/lib/fallback-analyzer"
import { TieredFallbackStrategy } from "@/lib/tiered-fallback-strategy"
import { FallbackMonitor } from "@/lib/fallback-monitor"

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
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("Error parsing request body:", parseError)
      return NextResponse.json(
        {
          error: "Invalid request format",
          success: false,
        },
        { status: 400 },
      )
    }

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
    const fallbackMonitor = FallbackMonitor.getInstance()

    // Select the best available AI model
    const { model, provider } = selectAIModel()

    // Track consecutive errors for this session
    const consecutiveErrors = 0
    const startTime = Date.now()

    // If no model is available, return a fallback response
    if (!model) {
      const errorCode = ErrorCodes.CONN_SERVICE_UNAVAILABLE
      const errorCategory = ErrorCategory.CONNECTIVITY

      // Log the error
      const errorLog = logError(
        "No AI models available",
        "AITutor.noModelsAvailable",
        {
          subject,
          provider: "none",
          sessionId,
        },
        undefined,
        sessionId,
      )

      // Analyze the fallback
      const trigger = fallbackAnalyzer.analyzeFallback("No AI models available", errorCode, errorCategory)

      // Record the fallback incident
      const incident = fallbackAnalyzer.recordFallback(trigger, "No AI models available", {
        errorCode,
        errorCategory,
        subject,
        topic,
        query: message,
        sessionId,
      })

      // Determine fallback tier
      const tier = fallbackStrategy.determineFallbackTier(consecutiveErrors, undefined, trigger)

      // Get fallback content
      const fallbackContent = fallbackStrategy.getFallbackContent(subject, topic, {
        tier,
        trigger,
        errorCode,
        isOfflineMode: true,
        query: message,
      })

      // Record fallback response for monitoring
      fallbackMonitor.recordFallbackResponse(incident, tier, {
        subject,
        topic,
        responseTime: Date.now() - startTime,
      })

      // Create diagnostics for debugging
      const diagnostics = {
        errorType: "NoModelsAvailable",
        errorMessage: "No AI models are currently available",
        provider: "none",
        consecutiveErrors,
        recommendation: "Configure at least one AI provider (OpenAI, Groq, or XAI)",
        userMessage: getUserFriendlyErrorMessage(errorLog.errorCode || ""),
        fallbackTier: tier,
        fallbackTrigger: trigger,
        fallbackContentType: fallbackContent.type,
      }

      return NextResponse.json({
        response: fallbackContent.content,
        success: true,
        fallback: true,
        provider: "none",
        errorCode,
        errorCategory,
        fallbackTier: tier,
        fallbackTrigger: trigger,
        fallbackContentType: fallbackContent.type,
        diagnostics,
      })
    }

    // Get the appropriate system prompt
    const systemPrompt = subjectPrompts[subject as keyof typeof subjectPrompts] || subjectPrompts.general

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
      updateServiceHealth(provider, "available")

      // Cache the successful response for potential future fallback
      fallbackStrategy.cacheResponse(subject, topic, message, response.text)

      // Record successful request for monitoring
      fallbackMonitor.recordSuccessfulRequest()

      // Return the AI response
      return NextResponse.json({
        response: response.text,
        success: true,
        provider: provider,
      })
    } catch (aiError: any) {
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

      // Analyze the fallback
      const trigger = fallbackAnalyzer.analyzeFallback(
        aiError instanceof Error ? aiError : String(aiError),
        errorLog.errorCode,
        errorLog.category,
      )

      // Record the fallback incident
      const incident = fallbackAnalyzer.recordFallback(trigger, String(aiError), {
        errorCode: errorLog.errorCode,
        errorCategory: errorLog.category,
        subject,
        topic,
        query: message,
        responseTime: Date.now() - startTime,
        sessionId,
      })

      // Determine fallback tier
      const tier = fallbackStrategy.determineFallbackTier(consecutiveErrors, Date.now() - startTime, trigger)

      // Get fallback content
      const fallbackContent = fallbackStrategy.getFallbackContent(subject, topic, {
        tier,
        trigger,
        errorCode: errorLog.errorCode,
        query: message,
      })

      // Record fallback response for monitoring
      fallbackMonitor.recordFallbackResponse(incident, tier, {
        subject,
        topic,
        responseTime: Date.now() - startTime,
      })

      // Create diagnostics for debugging
      const diagnostics = {
        errorType: aiError instanceof Error ? aiError.constructor.name : "Unknown",
        errorMessage: aiError instanceof Error ? aiError.message : String(aiError),
        provider,
        consecutiveErrors,
        recommendation: consecutiveErrors > 2 ? "Consider switching to a different AI provider" : "Retry your request",
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
        provider: provider,
        errorCode: errorLog.errorCode,
        errorCategory: errorLog.category,
        fallbackTier: tier,
        fallbackTrigger: trigger,
        fallbackContentType: fallbackContent.type,
        diagnostics,
      })
    }
  } catch (error: any) {
    console.error("Error in AI tutor API:", error)

    // Ensure we always return a valid JSON response
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        success: false,
        response: generateFallbackResponse("general", "An error occurred processing your request."),
        errorDetails: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
