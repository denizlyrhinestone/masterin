import { groqClient, checkGroqAvailability } from "../lib/groq-client"
import { generateText } from "ai"

async function testGroqConnection() {
  console.log("Testing Groq API connection...")

  const { available, message } = checkGroqAvailability()
  console.log(message)

  if (!available || !groqClient) {
    console.error("Groq API is not available. Please check your API key.")
    return
  }

  try {
    console.log("Sending test request to Groq API...")

    const response = await generateText({
      model: groqClient,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say hello and confirm you're working correctly." },
      ],
      temperature: 0.7,
      maxTokens: 100,
    })

    console.log("Groq API response:", response)
    console.log("Groq API connection test successful!")
  } catch (error) {
    console.error("Error testing Groq API:", error)
  }
}

testGroqConnection()
