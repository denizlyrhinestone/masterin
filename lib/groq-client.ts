import { GROQ_API_KEY } from "./env-config"

export function checkGroqAvailability() {
  if (!GROQ_API_KEY) {
    return {
      available: false,
      message: "Groq API key is not configured. Please add GROQ_API_KEY to your environment variables.",
    }
  }

  return {
    available: true,
    message: "Groq API key is configured and ready to use.",
  }
}

export async function testGroqConnection(prompt = "Hello, this is a test message.") {
  try {
    if (!GROQ_API_KEY) {
      return {
        success: false,
        message: "Groq API key is not configured.",
      }
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 100,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        message: `Groq API error: ${errorData.error?.message || response.statusText}`,
      }
    }

    return {
      success: true,
      message: "Groq API connection successful.",
    }
  } catch (error) {
    return {
      success: false,
      message: `Error connecting to Groq API: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
