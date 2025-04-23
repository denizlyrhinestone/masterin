import { supabase } from "@/lib/supabase"

export type MemoryItem = {
  type: "subject" | "feature" | "concept" | "question" | "preference" | "demographic" | "goal"
  value: string
  confidence: number // 0-1 scale
  timestamp: number
}

export type ConversationMemory = {
  userId: string | null
  sessionId: string
  items: MemoryItem[]
  lastUpdated: number
}

// Initialize a new memory object
export const initializeMemory = (userId: string | null, sessionId: string): ConversationMemory => {
  return {
    userId,
    sessionId,
    items: [],
    lastUpdated: Date.now(),
  }
}

// Add a new memory item
export const addMemoryItem = (memory: ConversationMemory, item: Omit<MemoryItem, "timestamp">): ConversationMemory => {
  const newItem: MemoryItem = {
    ...item,
    timestamp: Date.now(),
  }

  // Check if we already have this item type with the same value
  const existingIndex = memory.items.findIndex(
    (i) => i.type === item.type && i.value.toLowerCase() === item.value.toLowerCase(),
  )

  if (existingIndex >= 0) {
    // Update the existing item with higher confidence and new timestamp
    const updatedItems = [...memory.items]
    updatedItems[existingIndex] = {
      ...updatedItems[existingIndex],
      confidence: Math.max(updatedItems[existingIndex].confidence, item.confidence),
      timestamp: Date.now(),
    }

    return {
      ...memory,
      items: updatedItems,
      lastUpdated: Date.now(),
    }
  }

  // Add new item
  return {
    ...memory,
    items: [...memory.items, newItem],
    lastUpdated: Date.now(),
  }
}

// Get memory items by type
export const getMemoryItemsByType = (memory: ConversationMemory, type: MemoryItem["type"]): MemoryItem[] => {
  return memory.items.filter((item) => item.type === type).sort((a, b) => b.confidence - a.confidence) // Sort by confidence
}

// Get the most recent or highest confidence memory item of a specific type
export const getTopMemoryItem = (memory: ConversationMemory, type: MemoryItem["type"]): MemoryItem | null => {
  const items = getMemoryItemsByType(memory, type)
  if (items.length === 0) return null

  // Sort by confidence first, then by recency
  return items.sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence
    return b.timestamp - a.timestamp
  })[0]
}

// Save memory to database for logged-in users
export const persistMemory = async (memory: ConversationMemory): Promise<boolean> => {
  if (!memory.userId) return false // Don't persist for anonymous users

  try {
    const { error } = await supabase.from("user_memory").upsert({
      user_id: memory.userId,
      session_id: memory.sessionId,
      memory_data: memory.items,
      updated_at: new Date().toISOString(),
    })

    return !error
  } catch (e) {
    console.error("Error persisting memory:", e)
    return false
  }
}

// Load memory from database for logged-in users
export const loadMemory = async (userId: string): Promise<ConversationMemory | null> => {
  try {
    const { data, error } = await supabase
      .from("user_memory")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single()

    if (error || !data) return null

    return {
      userId,
      sessionId: data.session_id,
      items: data.memory_data,
      lastUpdated: new Date(data.updated_at).getTime(),
    }
  } catch (e) {
    console.error("Error loading memory:", e)
    return null
  }
}

// Extract memory items from conversation
export const extractMemoryFromMessages = (messages: Array<{ role: string; content: string }>): MemoryItem[] => {
  const memoryItems: MemoryItem[] = []

  // Simple pattern matching for demonstration
  // In a production system, this would use more sophisticated NLP
  for (const message of messages) {
    if (message.role !== "user") continue

    const content = message.content.toLowerCase()

    // Extract subjects
    for (const subject of ["math", "science", "history", "english", "programming", "physics", "chemistry"]) {
      if (content.includes(subject)) {
        memoryItems.push({
          type: "subject",
          value: subject,
          confidence: 0.8,
          timestamp: Date.now(),
        })
      }
    }

    // Extract features of interest
    for (const feature of ["tutor", "essay", "math solver", "code", "study notes"]) {
      if (content.includes(feature)) {
        memoryItems.push({
          type: "feature",
          value: feature,
          confidence: 0.8,
          timestamp: Date.now(),
        })
      }
    }

    // Extract learning goals
    if (content.includes("learn") || content.includes("understand") || content.includes("help with")) {
      const goalMatch = content.match(/(learn|understand|help with|study|practice) ([\w\s]+)/)
      if (goalMatch && goalMatch[2]) {
        memoryItems.push({
          type: "goal",
          value: goalMatch[2].trim(),
          confidence: 0.7,
          timestamp: Date.now(),
        })
      }
    }
  }

  return memoryItems
}

// Generate a system prompt enhancement based on memory
export const generateMemoryPrompt = (memory: ConversationMemory): string => {
  let prompt = "Based on our conversation, I understand that:\n\n"

  // Add subjects
  const subjects = getMemoryItemsByType(memory, "subject")
  if (subjects.length > 0) {
    prompt += "- You're interested in these subjects: " + subjects.map((s) => s.value).join(", ") + "\n"
  }

  // Add features
  const features = getMemoryItemsByType(memory, "feature")
  if (features.length > 0) {
    prompt += "- You've asked about these platform features: " + features.map((f) => f.value).join(", ") + "\n"
  }

  // Add goals
  const goals = getMemoryItemsByType(memory, "goal")
  if (goals.length > 0) {
    prompt += "- Your learning goals include: " + goals.map((g) => g.value).join(", ") + "\n"
  }

  return prompt
}
