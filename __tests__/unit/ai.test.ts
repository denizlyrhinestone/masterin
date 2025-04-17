import { sanitizeMessages, getAIService } from "../../lib/ai"
import * as mockAI from "../../lib/ai/mock"
import * as xaiService from "../../lib/ai/xai"
import { jest, describe, beforeEach, it, expect } from "@jest/globals"

// Mock dependencies
jest.mock("../../lib/db", () => ({
  isPreviewEnvironment: jest.fn(),
}))

jest.mock("../../lib/logger", () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}))

jest.mock("../../lib/ai/xai", () => ({
  isConfigured: jest.fn(),
  generateResponse: jest.fn(),
  streamResponse: jest.fn(),
}))

jest.mock("../../lib/ai/mock", () => ({
  generateResponse: jest.fn(),
  streamResponse: jest.fn(),
}))

describe("AI Module", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("sanitizeMessages", () => {
    it("should trim and limit message content length", () => {
      const messages = [
        { role: "user", content: "  Hello  " },
        { role: "assistant", content: "Hi there" },
        { role: "user", content: "A".repeat(5000) },
      ]

      const sanitized = sanitizeMessages(messages)

      expect(sanitized[0].content).toBe("Hello")
      expect(sanitized[2].content.length).toBe(4000)
    })

    it("should handle non-string content", () => {
      const messages = [
        { role: "user", content: { custom: "object" } },
        { role: "assistant", content: null },
      ]

      const sanitized = sanitizeMessages(messages)

      expect(sanitized[0].content).toEqual({ custom: "object" })
      expect(sanitized[1].content).toBeNull()
    })
  })

  describe("getAIService", () => {
    it("should return mock service in preview environment", () => {
      require("../../lib/db").isPreviewEnvironment.mockReturnValue(true)

      const service = getAIService()

      expect(service).toBe(mockAI)
    })

    it("should return mock service when XAI is not configured", () => {
      require("../../lib/db").isPreviewEnvironment.mockReturnValue(false)
      process.env.XAI_API_KEY = ""
      xaiService.isConfigured.mockReturnValue(false)

      const service = getAIService()

      expect(service).toBe(mockAI)
    })

    it("should return XAI service when properly configured", () => {
      require("../../lib/db").isPreviewEnvironment.mockReturnValue(false)
      process.env.XAI_API_KEY = "valid-key"
      xaiService.isConfigured.mockReturnValue(true)

      const service = getAIService()

      expect(service).toBe(xaiService)
    })

    it("should handle errors and fall back to mock", () => {
      require("../../lib/db").isPreviewEnvironment.mockReturnValue(false)
      process.env.XAI_API_KEY = "valid-key"
      xaiService.isConfigured.mockImplementation(() => {
        throw new Error("Configuration error")
      })

      const service = getAIService()

      expect(service).toBe(mockAI)
      expect(require("../../lib/logger").logger.error).toHaveBeenCalled()
    })
  })
})
