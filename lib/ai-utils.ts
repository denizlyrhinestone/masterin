import { openai } from "@ai-sdk/openai"
import { groq } from "@ai-sdk/groq"
import { xai } from "@ai-sdk/xai"
import { isValidOpenAIKey } from "./api-key-validator"

type ModelProvider = "openai" | "groq" | "xai" | "fallback"

// Cache API key validation results to avoid repeated checks
const keyValidationCache = new Map<string, boolean>()

/**
 * Selects the best available AI model based on environment variables
 * with enhanced validation and error logging
 */
export async function selectAIModel() {
  console.log("Selecting AI model...")

  // Check for OpenAI API key with validation
  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey) {
    // Basic format validation
    if (!isValidOpenAIKey(openaiKey)) {
      console.error("OpenAI API key format is invalid")
      // Continue to next provider
    } else {
      // Check cache first to avoid repeated validation
      if (keyValidationCache.has(openaiKey)) {
        if (keyValidationCache.get(openaiKey)) {
          console.log("Using cached validated OpenAI model")
          return {
            model: openai("gpt-4o"),
            provider: "openai" as ModelProvider,
          }
        }
      } else {
        try {
          console.log("Initializing OpenAI model...")
          return {
            model: openai("gpt-4o"),
            provider: "openai" as ModelProvider,
          }
        } catch (error) {
          console.error("Error initializing OpenAI model:", error)
          // Continue to next provider
        }
      }
    }
  } else {
    console.log("No OpenAI API key found")
  }

  // Check for Groq API key
  if (process.env.GROQ_API_KEY) {
    try {
      console.log("Initializing Groq model...")
      return {
        model: groq("llama3-70b-8192"),
        provider: "groq" as ModelProvider,
      }
    } catch (error) {
      console.error("Error initializing Groq model:", error)
      // Continue to next provider
    }
  }

  // Check for XAI (Grok) API key
  if (process.env.XAI_API_KEY) {
    try {
      console.log("Initializing XAI model...")
      return {
        model: xai("grok-1"),
        provider: "xai" as ModelProvider,
      }
    } catch (error) {
      console.error("Error initializing XAI model:", error)
      // Continue to fallback
    }
  }

  // Fallback to a simple response generator
  console.log("No valid AI models available, using fallback")
  return {
    model: null,
    provider: "fallback" as ModelProvider,
  }
}

/**
 * Generates a fallback response when no AI model is available
 */
export function generateFallbackResponse(subject: string, message: string): string {
  const fallbackResponses = {
    math: [
      "In mathematics, it's important to understand the underlying concepts rather than just memorizing formulas. Could you tell me more specifically what math topic you're working on?",
      "Mathematics builds on foundational concepts. Let's break down your question step by step. Could you provide more details about what you're trying to solve?",
      "When approaching math problems, I recommend starting with the basics and working your way up. What specific concept are you struggling with?",
    ],
    science: [
      "Science is all about observation, hypothesis, and experimentation. Could you tell me more about the specific scientific concept you're interested in?",
      "In science, we often use models to understand complex phenomena. What particular aspect of science are you studying?",
      "Scientific understanding evolves over time as we gather more evidence. What specific science topic would you like to explore?",
    ],
    general: [
      "Learning is most effective when we connect new information to what we already know. Could you tell me more about what you're trying to learn?",
      "I'd be happy to help you understand this topic better. Could you provide more specific details about your question?",
      "Education is a journey of discovery. Let's explore this topic together. What specific aspects are you curious about?",
    ],
  }

  const subjectResponses = fallbackResponses[subject as keyof typeof fallbackResponses] || fallbackResponses.general
  const randomIndex = Math.floor(Math.random() * subjectResponses.length)
  return subjectResponses[randomIndex]
}
