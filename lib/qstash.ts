import { Client } from "@upstash/qstash"

// Create a QStash client using environment variables
const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN || "",
})

export default qstashClient

// Helper function to publish a message to QStash
export async function publishMessage<T extends object>(
  destination: string,
  body: T,
  options?: {
    delay?: number // Delay in seconds
    cron?: string // Cron expression for scheduling
    retry?: number // Number of retries
  },
) {
  try {
    const response = await qstashClient.publishJSON({
      url: destination,
      body,
      delay: options?.delay,
      cron: options?.cron,
      retry: options?.retry,
    })

    return {
      success: true,
      messageId: response.messageId,
    }
  } catch (error) {
    console.error("Failed to publish message to QStash:", error)
    return {
      success: false,
      error,
    }
  }
}
