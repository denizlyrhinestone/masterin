import { NextResponse } from "next/server"
import { generateQuiz } from "@/lib/ai-service"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { subject, topic, numberOfQuestions, difficultyLevel, questionTypes } = await request.json()

    // Validate input
    if (!subject || !topic || !numberOfQuestions || !difficultyLevel) {
      return NextResponse.json(
        { error: "Subject, topic, number of questions, and difficulty level are required" },
        { status: 400 },
      )
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

    // Generate quiz
    const quiz = await generateQuiz(subject, topic, numberOfQuestions, difficultyLevel, questionTypes)

    // Save to database
    const { data, error } = await supabase
      .from("ai_quizzes")
      .insert({
        user_id: userId,
        title: quiz.title,
        subject,
        topic,
        difficulty: difficultyLevel,
        content: quiz,
        is_public: false,
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error saving quiz:", error)
      return NextResponse.json({ error: "Failed to save quiz" }, { status: 500 })
    }

    return NextResponse.json({
      quiz,
      id: data.id,
    })
  } catch (error) {
    console.error("Error in quiz generator API:", error)
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get("id")

    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // If ID is provided, get specific quiz
    if (id) {
      const { data, error } = await supabase.from("ai_quizzes").select("*").eq("id", id).single()

      if (error) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
      }

      // Check if user has access
      if (data.user_id !== userId && !data.is_public) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      return NextResponse.json(data)
    }

    // Otherwise, get all quizzes for the user
    const { data, error } = await supabase
      .from("ai_quizzes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 })
  }
}
