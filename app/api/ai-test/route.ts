import { NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { isValidOpenAIKey, testOpenAIKey } from "@/lib/api-key-validator"

export async function GET() {
  try {
    const openaiKey = process.env.OPENAI_API_KEY

    // Basic validation
    if (!openaiKey) {
      return NextResponse.json({
        status: "error",
        message: "OpenAI API key is not configured",
        timestamp: new Date().toISOString(),
      })
    }

    if (!isValidOpenAIKey(openaiKey)) {
      return NextResponse.json({
        status: "error",
        message: "OpenAI API key format is invalid",
        timestamp: new Date().toISOString(),
      })
    }

    // Test the key with a direct API call
    const keyTest = await testOpenAIKey(openaiKey)

    if (!keyTest.valid) {
      return NextResponse.json({
        status: "error",
        message: `API key validation failed: ${keyTest.error}`,
        timestamp: new Date().toISOString(),
      })
    }

    // Try a simple AI SDK call
    try {
      const response = await generateText({
        model: openai("gpt-4o"),
        prompt: "Say hello in one word",
        temperature: 0.5,
        maxTokens: 10,
      })

      return NextResponse.json({
        status: "success",
        message: "OpenAI API key is valid and working",
        test_response: response.text,
        timestamp: new Date().toISOString(),
      })
    } catch (aiError: any) {
      return NextResponse.json({
        status: "error",
        message: "API key validation succeeded but AI SDK test failed",
        error: aiError.message,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: "Error testing OpenAI API key",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}
