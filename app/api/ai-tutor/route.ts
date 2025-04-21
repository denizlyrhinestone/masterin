import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Define the system prompts for different subjects
const subjectPrompts: Record<string, string> = {
  general: `You are an educational AI tutor named Masterin Tutor. Your goal is to help students learn and understand concepts across various subjects. 
  Be friendly, encouraging, and explain concepts in a clear, concise manner. 
  When appropriate, break down complex topics into simpler parts. 
  If you don't know something, admit it rather than making up information.`,

  math: `You are a mathematics tutor. Explain mathematical concepts clearly and provide step-by-step solutions to problems. 
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

    console.log(`AI Tutor request received - Subject: ${subject}`)

    // Get the appropriate system prompt based on the selected subject
    const systemPrompt = subjectPrompts[subject] || subjectPrompts.general

    // Format the conversation history for the AI
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }))

    // Generate response using AI SDK
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages: [...formattedHistory, { role: "user", content: message }],
    })

    console.log("AI Tutor response generated successfully")

    // Return the AI response
    return NextResponse.json({ response: text, success: true })
  } catch (error) {
    console.error("Error in AI tutor API:", error)
    return NextResponse.json({ error: "Failed to process your request", success: false }, { status: 500 })
  }
}
