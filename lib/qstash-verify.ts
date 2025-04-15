import { Receiver } from "@upstash/qstash"
import type { NextRequest } from "next/server"

// Create a QStash receiver for verifying incoming messages
const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || "",
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || "",
})

// Verify a QStash message
export async function verifyQStashSignature(request: NextRequest): Promise<{ isValid: boolean; body: any }> {
  try {
    const signature = request.headers.get("upstash-signature") || ""

    // Get the raw body as text
    const rawBody = await request.text()

    // Verify the signature
    const isValid = await receiver.verify({
      signature,
      body: rawBody,
    })

    // Parse the body if valid
    const body = isValid ? JSON.parse(rawBody) : null

    return { isValid, body }
  } catch (error) {
    console.error("Failed to verify QStash signature:", error)
    return { isValid: false, body: null }
  }
}
