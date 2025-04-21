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

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json()
    const { message, subject = "general", history = [] } = body

    // Validate inputs
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message format", success: false }, { status: 400 })
    }

    console.log(`AI Tutor request received - Subject: ${subject}`)

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
      const fallbackResponse = generateFallbackResponse(subject, message)

      return NextResponse.json({
        response: fallbackResponse,
        success: true,
        fallback: true,
        provider: "fallback",
        timestamp: new Date().toISOString(),
      })
    }

    try {
      // Generate response using AI SDK with proper error handling
      const response = await generateText({
        model: model,
        system: systemPrompt,
        messages: [...formattedHistory, { role: "user", content: message }],
        temperature: 0.7, // Add some variability to responses
        maxTokens: 1000, // Limit response length
      })

      console.log(`AI Tutor response generated successfully using ${provider}`)

      // Return the AI response
      return NextResponse.json({
        response: response.text,
        success: true,
        provider: provider,
        timestamp: new Date().toISOString(),
      })
    } catch (aiError: any) {
      console.error(`${provider} AI SDK Error:`, aiError)

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
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error: any) {
    console.error("Error in AI tutor API:", error)

    // Determine the appropriate error message and status code
    let errorMessage = "Failed to process your request"
    let statusCode = 500

    if (error.code === "ECONNRESET" || error.code === "ETIMEDOUT") {
      errorMessage = "Connection to AI service failed. Please try again later."
      statusCode = 503 // Service Unavailable
    } else if (error.message?.includes("rate limit")) {
      errorMessage = "AI service rate limit exceeded. Please try again in a few moments."
      statusCode = 429 // Too Many Requests
    }

    return NextResponse.json(
      {
        error: errorMessage,
        success: false,
        errorCode: statusCode,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode },
    )
  }
}
