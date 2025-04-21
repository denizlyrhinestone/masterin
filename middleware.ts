import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Only apply to AI API routes
  if (request.nextUrl.pathname.startsWith("/api/ai-tutor")) {
    // Check if we have the required API keys
    const hasOpenAIKey = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY || process.env.XAI_API_KEY

    if (!hasOpenAIKey) {
      console.error("Missing required API key for AI services")

      // Return a more helpful error response
      return NextResponse.json(
        {
          error: "AI service configuration error. Please check server logs.",
          success: false,
          errorCode: "MISSING_API_KEY",
        },
        { status: 500 },
      )
    }
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/api/ai-tutor/:path*",
}
