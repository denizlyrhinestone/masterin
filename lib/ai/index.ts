import { logger } from "../logger"
import { isPreviewEnvironment } from "../db"
import * as mockAI from "./mock"
import * as xaiService from "./xai"

// AI service interface
export interface AIService {
  generateResponse(
    messages: any[],
    options?: any,
  ): Promise<{
    content: string
    metadata?: any
    error?: string
  }>

  streamResponse(messages: any[], options?: any): Response
}

// Get appropriate AI service based on environment and configuration
export function getAIService(): AIService {
  // Check if we're in preview mode or AI is not configured
  const usePreviewMode = isPreviewEnvironment() || !process.env.XAI_API_KEY

  if (usePreviewMode) {
    logger.info("Using mock AI service", {
      reason: isPreviewEnvironment() ? "preview environment" : "AI not configured",
    })
    return mockAI
  }

  try {
    // Verify AI service is properly configured
    if (!xaiService.isConfigured()) {
      logger.warn("XAI service not properly configured, falling back to mock")
      return mockAI
    }

    logger.info("Using XAI service")
    return xaiService
  } catch (error) {
    logger.error("Error initializing AI service, falling back to mock", { error })
    return mockAI
  }
}

// Helper to sanitize user messages
export function sanitizeMessages(messages: any[]): any[] {
  return messages.map((message) => ({
    ...message,
    content:
      typeof message.content === "string"
        ? message.content
            .trim()
            .substring(0, 4000) // Prevent excessively long messages
        : message.content,
  }))
}
