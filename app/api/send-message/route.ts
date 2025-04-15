import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

export async function POST(request: Request) {
  try {
    const { userId, message } = await request.json()

    if (!userId || !message) {
      return NextResponse.json({ error: "Missing userId or message" }, { status: 400 })
    }

    // Store user message in Firestore
    const docRef = await addDoc(collection(db, "userChats", userId, "messages"), {
      text: message,
      sender: "user",
      createdAt: serverTimestamp(),
    })

    // Trigger AI response generation
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://masterin.org"
    const aiResponseResult = await fetch(`${baseUrl}/api/ai-response`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        messageId: docRef.id,
      }),
    })

    if (!aiResponseResult.ok) {
      console.error("Failed to trigger AI response")
    }

    return NextResponse.json({ success: true, messageId: docRef.id })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
