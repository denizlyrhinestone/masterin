import { NextResponse } from "next/server"
import { generateText } from "ai"
import { selectAIModel, performAIDiagnostics } from "@/lib/ai-utils"
import { logError, ErrorSeverity, ErrorCodes, getUserFriendlyErrorMessage } from "@/lib/error-handling"
import { HealthMonitor, ServiceType, HealthStatus, createAIModelHealthCheck } from "@/lib/health-monitoring"
import { AlertManager, AlertType, AlertSeverity } from "@/lib/alert-system"
import { FallbackStrategy } from "@/lib/fallback-strategy"

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

// Initialize health monitoring for AI models
function initializeHealthMonitoring() {
  const healthMonitor = HealthMonitor.getInstance()
  const alertManager = AlertManager.getInstance()

  // Register health check for OpenAI
  if (process.env.OPENAI_API_KEY) {
    healthMonitor.registerHealthCheck(
      `${ServiceType.AI_MODEL}.openai`,
      createAIModelHealthCheck("openai", async () => {
        try {
          // Simple health check query
          const { model } = selectAIModel()
          if (!model) return false

          const response = await generateText({
            model,
            prompt: "Health check: Are you operational?",
            system: "You are a health check system. Respond with 'operational' only.",
            maxTokens: 10,
          })

          return response.text.toLowerCase().includes("operational")
        } catch (error) {
          logError(error instanceof Error ? error : String(error), "HealthCheck.openai", {})
          return false
        }
      }),
      300000, // Check every 5 minutes
    )
  }

  // Register alert callback
  healthMonitor.registerAlertCallback((incident) => {
    alertManager.createAlertFromHealthIncident(incident)
  })
}

// Initialize health monitoring on first import
initializeHealthMonitoring()

export async function POST(request: Request) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const startTime = Date.now()

  try {
    // Parse the request body
    const body = await request.json()
    const { message, subject = "general", history = [], healthCheck = false, sessionId, userId, topic } = body

    // Validate inputs
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          error: "Invalid message format",
          success: false,
          errorCode: ErrorCodes.CLIENT_INVALID_INPUT,
        },
        { status: 400 },
      )
    }

    console.log(
      `AI Tutor request received - Subject: ${subject}, Message length: ${message.length}, Health check: ${healthCheck}, Request ID: ${requestId}`,
    )

    // Get the appropriate system prompt based on the selected subject
    const systemPrompt = subjectPrompts[subject] || subjectPrompts.general

    // Format the conversation history for the AI
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Get fallback strategy instance
    const fallbackStrategy = FallbackStrategy.getInstance()

    // Check for cached response first if not a health check
    if (!healthCheck) {
      const cachedResponse = fallbackStrategy.getCachedResponse(subject, topic || "general", message)

      if (cachedResponse) {
        console.log(`Using cached response for subject: ${subject}, topic: ${topic || "general"}`)

        return NextResponse.json({
          response: cachedResponse.content,
          success: true,
          cached: true,
          provider: "cache",
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        })
      }
    }

    // Select the best available AI model
    const { model, provider } = selectAIModel()

    // If we don't have a model available, use fallback response
    if (provider === "fallback" || !model) {
      console.log("No AI model available, using fallback response")

      // Perform diagnostics to provide better error information
      const diagnostics = await performAIDiagnostics()

      // Get appropriate fallback content
      const fallbackContent = fallbackStrategy.getFallbackContent(
        subject,
        topic || "general",
        ErrorCodes.CONN_SERVICE_UNAVAILABLE,
      )

      // Log the error
      logError(
        "No AI model available",
        "AITutor.POST",
        {
          subject,
          topic,
          diagnostics,
          requestId,
        },
        userId,
        sessionId,
        requestId,
      )

      return NextResponse.json({
        response: fallbackContent.content,
        success: true,
        fallback: true,
        provider: "fallback",
        timestamp: new Date().toISOString(),
        diagnostics: diagnostics,
        errorCode: ErrorCodes.CONN_SERVICE_UNAVAILABLE,
        responseTime: Date.now() - startTime,
      })
    }

    // Check if we're in the error threshold cooldown period
    const timeSinceLastSuccess = Date.now() - lastSuccessfulCall
    if (consecutiveErrors >= ERROR_THRESHOLD && timeSinceLastSuccess < ERROR_COOLDOWN_MS) {
      console.log(`AI service in cooldown period after ${consecutiveErrors} consecutive errors`)

      // Get appropriate fallback content
      const fallbackContent = fallbackStrategy.getFallbackContent(
        subject,
        topic || "general",
        ErrorCodes.RATE_TOO_MANY_REQUESTS,
      )

      // Log the error
      logError(
        "AI service in cooldown period",
        "AITutor.POST",
        {
          consecutiveErrors,
          timeSinceLastSuccess,
          subject,
          topic,
          requestId,
        },
        userId,
        sessionId,
        requestId,
      )

      return NextResponse.json({
        response: fallbackContent.content,
        success: true,
        fallback: true,
        provider: "cooldown",
        errorCode: ErrorCodes.RATE_TOO_MANY_REQUESTS,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
      })
    }

    try {
      // For health checks, attempt a simpler prompt for quick response
      const promptContent = healthCheck
        ? "This is a health check. Please respond with 'operational' if you can process requests."
        : message

      // Log request sent to the AI provider for debugging
      console.log(`Sending request to ${provider} with model: ${model}, Request ID: ${requestId}`)

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
      console.log(
        `AI Tutor response generated successfully using ${provider} in ${responseTime}ms, Request ID: ${requestId}`,
      )

      // Reset error tracking
      lastSuccessfulCall = Date.now()
      consecutiveErrors = 0

      // Update health monitor
      const healthMonitor = HealthMonitor.getInstance()
      const serviceHealth = {
        service: `${ServiceType.AI_MODEL}.${provider}`,
        status: HealthStatus.OPERATIONAL,
        latency: responseTime,
        lastChecked: new Date().toISOString(),
        message: `${provider} is operational`,
      }(
        // We're using a private method, so we need to use any
        healthMonitor as any,
      ).updateServiceHealth(`${ServiceType.AI_MODEL}.${provider}`, serviceHealth)

      // Cache the response for future use if not a health check
      if (!healthCheck) {
        fallbackStrategy.cacheResponse(subject, topic || "general", message, response.text)
      }

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
      const errorLog = logError(
        aiError,
        "AITutor.generateText",
        {
          provider,
          consecutiveErrors,
          subject,
          topic,
          requestId,
          messageLength: message.length,
          historyLength: history.length,
        },
        userId,
        sessionId,
        requestId,
      )

      // Update health monitor
      const healthMonitor = HealthMonitor.getInstance()
      const serviceHealth = {
        service: `${ServiceType.AI_MODEL}.${provider}`,
        status: HealthStatus.DEGRADED,
        latency: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        message: `${provider} is experiencing issues: ${aiError.message}`,
      }(
        // We're using a private method, so we need to use any
        healthMonitor as any,
      ).updateServiceHealth(`${ServiceType.AI_MODEL}.${provider}`, serviceHealth)

      // Send alert if this is a critical error or recurring issue
      if (errorLog.severity === ErrorSeverity.CRITICAL || consecutiveErrors >= 3) {
        const alertManager = AlertManager.getInstance()
        await alertManager.sendAlert(
          AlertType.SERVICE_DEGRADED,
          AlertSeverity.ERROR,
          `AI Tutor Error: ${provider}`,
          `The AI tutor service is experiencing issues with ${provider}: ${aiError.message}`,
          "AITutor.POST",
          {
            provider,
            consecutiveErrors,
            errorCategory: errorLog.category,
            errorCode: errorLog.errorCode,
          },
        )
      }

      // Get appropriate fallback content based on error
      const fallbackContent = fallbackStrategy.getFallbackContent(subject, topic || "general", errorLog.errorCode)

      // Return a more informative fallback response
      return NextResponse.json({
        response: fallbackContent.content,
        success: true, // Mark as success to prevent frontend error display
        fallback: true,
        provider: provider,
        error: aiError.message,
        errorCode: errorLog.errorCode,
        errorCategory: errorLog.category,
        consecutiveErrors,
        diagnostics: {
          errorType: aiError.name || "Unknown",
          errorMessage: aiError.message || "No message available",
          provider: provider,
          consecutiveErrors,
          recommendation: consecutiveErrors > 2 ? "Consider switching to a different AI provider" : "Retry your request",\
          userMessage: getUserFriendlyErrorMessage(errorLog.errorCode  : "Retry your request",
          userMessage: getUserFriendlyErrorMessage(errorLog.errorCode),
          fallbackType: fallbackContent.type,
        },
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
      })
    }
  } catch (error: any) {
    console.error(`Error in AI tutor API: ${error.message}, Request ID: ${requestId}`)

    // Log the error with our enhanced error logging
    const errorLog = logError(error, "AITutor.POST", {
      requestId,
      responseTime: Date.now() - startTime,
    })

    // Get fallback strategy instance
    const fallbackStrategy = FallbackStrategy.getInstance()

    // Get appropriate fallback content based on error
    const fallbackContent = fallbackStrategy.getFallbackContent("general", "general", errorLog.errorCode)

    return NextResponse.json(
      {
        error: getUserFriendlyErrorMessage(errorLog.errorCode),
        success: false,
        errorCode: errorLog.errorCode,
        errorCategory: errorLog.category,
        fallbackResponse: fallbackContent.content,
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
      },
      { status: 500 },
    )
  }
}
