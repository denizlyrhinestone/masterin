import { createServer } from "http"
import { apiResolver } from "next/dist/server/api-utils/node"
import type { NextApiRequest, NextApiResponse } from "next"
import fetch from "node-fetch"
import handler from "../../app/api/ai-tutor/route"
import { jest } from "@jest/globals"

// Mock dependencies
jest.mock("../../lib/analytics", () => ({
  logInteraction: jest.fn().mockResolvedValue(true),
}))

jest.mock("../../lib/ai", () => ({
  getAIService: jest.fn().mockReturnValue({
    generateResponse: jest.fn().mockResolvedValue({
      content: "Mock response",
      metadata: { mock: true },
    }),
    streamResponse: jest.fn().mockReturnValue(
      new Response(JSON.stringify({ content: "Mock stream response" }), {
        headers: { "Content-Type": "application/json" },
      }),
    ),
  }),
  sanitizeMessages: jest.fn((messages) => messages),
}))

jest.mock("../../lib/privacy", () => ({
  filterSensitiveContent: jest.fn().mockReturnValue({ isAllowed: true, filteredContent: "Filtered content" }),
}))

jest.mock("../../lib/rate-limit", () => ({
  rateLimit: jest.fn().mockResolvedValue({ success: true, limit: 100, remaining: 99, reset: 0 }),
}))

describe("AI Tutor API (Integration)", () => {
  let server: any
  let port: number

  beforeAll(() => {
    // Create a test server
    port = 3000 + Math.floor(Math.random() * 1000)
    server = createServer((req, res) => {
      return apiResolver(
        req as unknown as NextApiRequest,
        res as unknown as NextApiResponse,
        undefined,
        handler,
        {},
        false,
      )
    }).listen(port)
  })

  afterAll((done) => {
    server.close(done)
  })

  it("should handle valid requests and return a response", async () => {
    const response = await fetch(`http://localhost:${port}/api/ai-tutor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello, can you help me with math?" }],
      }),
    })

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty("content")
    expect(data.content).toBe("Mock response")
  })

  it("should handle invalid requests", async () => {
    const response = await fetch(`http://localhost:${port}/api/ai-tutor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Missing messages array
      }),
    })

    expect(response.status).toBe(400)

    const data = await response.json()
    expect(data).toHaveProperty("error", "INVALID_REQUEST")
  })

  it("should handle content filtering", async () => {
    // Mock content filter to reject
    require("../../lib/privacy").filterSensitiveContent.mockReturnValueOnce({
      isAllowed: false,
      filteredContent: "Filtered content",
      reason: "prohibited_content",
    })

    const response = await fetch(`http://localhost:${port}/api/ai-tutor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "How to hack a website?" }],
      }),
    })

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty("filtered", true)
    expect(data).toHaveProperty("reason", "prohibited_content")
  })

  it("should handle rate limiting", async () => {
    // Mock rate limiter to reject
    require("../../lib/rate-limit").rateLimit.mockResolvedValueOnce({
      success: false,
      limit: 100,
      remaining: 0,
      reset: Math.floor(Date.now() / 1000) + 60,
    })

    const response = await fetch(`http://localhost:${port}/api/ai-tutor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
      }),
    })

    expect(response.status).toBe(429)

    const data = await response.json()
    expect(data).toHaveProperty("error", "RATE_LIMIT_EXCEEDED")
  })
})
