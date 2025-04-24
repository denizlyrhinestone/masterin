import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"
import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import platformInfo from "@/lib/platform-info"
import { analyzeQuery, logQueryAnalysis } from "@/lib/query-analyzer"
import { extractMemoryFromMessages, generateMemoryPrompt, isMemoryStale } from "@/lib/conversation-memory"
import { storeAttachmentMetadata } from "@/lib/file-upload"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    // Initialize Supabase
    const supabase = createServerSupabaseClient()

    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    let messages, conversationId, memory, attachments
    try {
      const body = await req.json()
      messages = body.messages
      conversationId = body.conversationId
      memory = body.memory || null
      attachments = body.attachments || []
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request format: messages must be an array" }, { status: 400 })
    }

    // Handle conversation persistence
    let conversation
    try {
      if (conversationId) {
        // Verify conversation ownership
        const { data, error } = await supabase
          .from("chat_conversations")
          .select("*")
          .eq("id", conversationId)
          .eq("user_id", session.user.id)
          .single()

        if (error || !data) {
          return NextResponse.json({ error: "Conversation not found or access denied" }, { status: 404 })
        }

        conversation = data
      } else {
        // Create a new conversation
        const title = messages[0]?.content?.slice(0, 50) + "..." || "New conversation"
        const { data, error } = await supabase
          .from("chat_conversations")
          .insert({
            user_id: session.user.id,
            title,
          })
          .select()
          .single()

        if (error) {
          console.error("Error creating conversation:", error)
          return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
        }

        conversation = data
      }
    } catch (error) {
      console.error("Error handling conversation persistence:", error)
      // Create a temporary conversation object to allow the chat to continue
      conversation = {
        id: conversationId || `temp-${Date.now()}`,
        user_id: session.user.id,
        title: "Temporary conversation",
      }
    }

    // Store user message in database
    let userMessageId = null
    try {
      if (messages.length > 0) {
        const latestMessage = messages[messages.length - 1]
        if (latestMessage.role === "user") {
          const { data: messageData, error: messageError } = await supabase
            .from("chat_messages")
            .insert({
              conversation_id: conversation.id,
              role: latestMessage.role,
              content: latestMessage.content,
              has_attachments: attachments.length > 0,
            })
            .select()
            .single()

          if (messageError) {
            console.error("Error storing user message:", messageError)
            // Continue execution even if message storage fails
          } else {
            userMessageId = messageData.id

            // Store attachments if any
            if (attachments.length > 0 && userMessageId) {
              for (const attachment of attachments) {
                await storeAttachmentMetadata(userMessageId, attachment, supabase)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error storing user message:", error)
      // Continue execution even if message storage fails
    }

    // Analyze the latest user query
    const latestUserMessage = messages.filter((m) => m.role === "user").pop()
    let queryAnalysis = null
    let memoryPrompt = ""

    if (latestUserMessage) {
      try {
        queryAnalysis = analyzeQuery(latestUserMessage.content)
        logQueryAnalysis(latestUserMessage.content, queryAnalysis)

        // Extract memory from conversation
        if (!memory) {
          const extractedMemory = extractMemoryFromMessages(messages)
          if (extractedMemory.length > 0) {
            memoryPrompt = generateMemoryPrompt({
              userId: session.user.id,
              sessionId: conversation.id,
              items: extractedMemory,
              lastUpdated: Date.now(),
            })
          }
        } else if (!isMemoryStale(memory, 60)) {
          // Use memory if it's not stale (less than 60 minutes old)
          memoryPrompt = generateMemoryPrompt(memory)
        } else {
          // If memory is stale, extract fresh memory from the conversation
          const extractedMemory = extractMemoryFromMessages(messages)
          if (extractedMemory.length > 0) {
            memoryPrompt = generateMemoryPrompt({
              userId: session.user.id,
              sessionId: conversation.id,
              items: extractedMemory,
              lastUpdated: Date.now(),
            })
          }
        }
      } catch (error) {
        console.error("Error analyzing query or generating memory prompt:", error)
        // Continue without analysis if it fails
      }
    }

    // Create attachment descriptions for the AI
    let attachmentDescriptions = ""
    if (attachments.length > 0) {
      attachmentDescriptions = `
USER ATTACHMENTS:
The user has uploaded ${attachments.length} file(s):
${attachments.map((att, index) => `${index + 1}. ${att.filename} (${att.contentType})`).join("\n")}

For image files, I'll describe what I see in them. For document files, I'll analyze their content and provide insights.
`
    }

    // Enhanced system prompt with platform-specific context and user context
    const enhancedSystemPrompt = `
You are an AI assistant from ${platformInfo.name}, an educational platform that offers AI-powered learning tools. Your goal is to provide helpful, accurate, and engaging responses about the platform and educational topics.

ABOUT ${platformInfo.name.toUpperCase()}:
${platformInfo.name} is an AI-powered educational platform that offers several tools:
${platformInfo.features.map((feature, index) => `${index + 1}. ${feature.name}: ${feature.description}`).join("\n")}

PRICING:
- ${platformInfo.pricing.free.name}: ${platformInfo.pricing.free.price} (${platformInfo.pricing.free.features.slice(0, 3).join(", ")})
- ${platformInfo.pricing.premium.name}: ${platformInfo.pricing.premium.price} (${platformInfo.pricing.premium.features.slice(0, 3).join(", ")})
- ${platformInfo.pricing.team.name}: ${platformInfo.pricing.team.price} (${platformInfo.pricing.team.features.slice(0, 3).join(", ")})

SUBJECTS COVERED:
${platformInfo.subjects.map((subject) => subject.name).join(", ")}

${
  memoryPrompt
    ? `USER CONTEXT:
${memoryPrompt}
`
    : ""
}

${
  queryAnalysis
    ? `QUERY ANALYSIS:
The user's query appears to be a ${queryAnalysis.type.replace("_", " ")}${queryAnalysis.subject ? ` about ${queryAnalysis.subject}` : ""}${queryAnalysis.feature ? ` regarding the ${queryAnalysis.feature} feature` : ""} with ${queryAnalysis.confidence * 100}% confidence.
`
    : ""
}

${attachmentDescriptions}

GUIDELINES:
1. Be educational, supportive, and engaging
2. Provide clear, accurate, and helpful explanations
3. Format responses with markdown for better readability
4. Include examples, analogies, and step-by-step explanations when appropriate
5. Be specific about ${platformInfo.name}'s features and capabilities
6. Tailor responses to the user's questions and needs
7. If asked about a topic outside your knowledge, acknowledge limitations and suggest resources
8. When appropriate, recommend relevant platform features that could help the user
9. For uploaded images, describe what you see and provide relevant educational context
10. For uploaded documents, analyze the content and provide helpful insights

Remember to maintain a helpful, educational tone throughout the conversation.
`

    try {
      // Use the Groq API to generate a response with enhanced system prompt
      const result = streamText({
        model: groq("llama3-70b-8192"),
        system: enhancedSystemPrompt,
        messages,
        maxTokens: 2000, // Limit response length
      })

      // Store assistant's response in database when completed
      result.on("done", async (completion) => {
        try {
          await supabase.from("chat_messages").insert({
            conversation_id: conversation.id,
            role: "assistant",
            content: completion.content,
          })

          // Update conversation title if this is the first exchange
          const { count } = await supabase
            .from("chat_messages")
            .select("id", { count: "exact", head: true })
            .eq("conversation_id", conversation.id)

          if (count === 2) {
            // First user message + first AI response
            const userMessage = messages.find((m) => m.role === "user")?.content || ""
            const betterTitle = userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : "")

            await supabase.from("chat_conversations").update({ title: betterTitle }).eq("id", conversation.id)
          }
        } catch (error) {
          console.error("Error storing assistant message:", error)
        }
      })

      // Include the conversation ID in the response metadata
      return result.toDataStreamResponse((data) => ({
        ...data,
        conversationId: conversation.id,
      }))
    } catch (error) {
      console.error("Error generating AI response:", error)
      return NextResponse.json(
        {
          error: "An error occurred while generating the AI response",
          details: process.env.NODE_ENV === "development" ? String(error) : undefined,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      {
        error: "An error occurred while processing your request",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 },
    )
  }
}
