import { NextResponse } from "next/server"
import { updateUserProfilePicture } from "@/lib/services/users"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = params.id
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing image URL" }, { status: 400 })
    }

    // Update user profile in database
    const success = await updateUserProfilePicture(userId, imageUrl)

    if (!success) {
      return NextResponse.json({ error: "Failed to update profile picture" }, { status: 500 })
    }

    return NextResponse.json({ success: true, imageUrl })
  } catch (error) {
    console.error("Error updating profile picture:", error)
    return NextResponse.json({ error: "Failed to update profile picture" }, { status: 500 })
  }
}
