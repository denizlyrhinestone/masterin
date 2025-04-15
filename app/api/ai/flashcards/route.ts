import { NextResponse } from "next/server"
import { generateFlashcards } from "@/lib/ai-service"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { subject, topic, numberOfCards, content, title } = await request.json()

    // Validate input
    if (!subject || !topic || !numberOfCards || !title) {
      return NextResponse.json({ error: "Subject, topic, number of cards, and title are required" }, { status: 400 })
    }

    // Get user from session
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Generate flashcards
    const flashcards = await generateFlashcards(subject, topic, numberOfCards, content)

    // Create flashcard deck
    const { data: deckData, error: deckError } = await supabase
      .from("ai_flashcard_decks")
      .insert({
        user_id: userId,
        title,
        subject,
        topic,
        is_public: false,
      })
      .select("id")
      .single()

    if (deckError) {
      console.error("Error creating flashcard deck:", deckError)
      return NextResponse.json({ error: "Failed to create flashcard deck" }, { status: 500 })
    }

    const deckId = deckData.id

    // Insert flashcards
    const flashcardsToInsert = flashcards.map((card) => ({
      deck_id: deckId,
      front: card.front,
      back: card.back,
      category: card.category || null,
    }))

    const { error: cardsError } = await supabase.from("ai_flashcards").insert(flashcardsToInsert)

    if (cardsError) {
      console.error("Error inserting flashcards:", cardsError)
      return NextResponse.json({ error: "Failed to save flashcards" }, { status: 500 })
    }

    return NextResponse.json({
      flashcards,
      deckId,
    })
  } catch (error) {
    console.error("Error in flashcard generator API:", error)
    return NextResponse.json({ error: "Failed to generate flashcards" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const deckId = url.searchParams.get("deckId")

    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // If deck ID is provided, get flashcards for that deck
    if (deckId) {
      // First check if user has access to this deck
      const { data: deckData, error: deckError } = await supabase
        .from("ai_flashcard_decks")
        .select("*")
        .eq("id", deckId)
        .single()

      if (deckError) {
        return NextResponse.json({ error: "Deck not found" }, { status: 404 })
      }

      // Check if user has access
      if (deckData.user_id !== userId && !deckData.is_public) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      // Get flashcards
      const { data: cards, error: cardsError } = await supabase
        .from("ai_flashcards")
        .select("*")
        .eq("deck_id", deckId)
        .order("created_at", { ascending: true })

      if (cardsError) {
        return NextResponse.json({ error: "Failed to fetch flashcards" }, { status: 500 })
      }

      return NextResponse.json({
        deck: deckData,
        cards,
      })
    }

    // Otherwise, get all decks for the user
    const { data, error } = await supabase
      .from("ai_flashcard_decks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch flashcard decks" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching flashcards:", error)
    return NextResponse.json({ error: "Failed to fetch flashcards" }, { status: 500 })
  }
}
