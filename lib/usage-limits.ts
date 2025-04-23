"use client"

// Constants
const FREE_USAGE_LIMIT = 3
const STORAGE_KEY = "masterin_tool_usage"
const USAGE_EXPIRY_DAYS = 7

interface ToolUsage {
  [toolId: string]: {
    count: number
    lastUsed: number
  }
}

// Initialize usage from localStorage
const getStoredUsage = (): ToolUsage => {
  if (typeof window === "undefined") return {}

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return {}

    const usage = JSON.parse(stored) as ToolUsage

    // Clean up expired usage data
    const now = Date.now()
    const expiryTime = USAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000

    Object.keys(usage).forEach((toolId) => {
      if (now - usage[toolId].lastUsed > expiryTime) {
        delete usage[toolId]
      }
    })

    return usage
  } catch (e) {
    console.error("Error reading usage data:", e)
    return {}
  }
}

// Save usage to localStorage
const saveUsage = (usage: ToolUsage): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage))
  } catch (e) {
    console.error("Error saving usage data:", e)
  }
}

// Track tool usage
export const trackToolUsage = (toolId: string): boolean => {
  const usage = getStoredUsage()

  // Initialize tool usage if not exists
  if (!usage[toolId]) {
    usage[toolId] = {
      count: 0,
      lastUsed: Date.now(),
    }
  }

  // Check if limit reached
  if (usage[toolId].count >= FREE_USAGE_LIMIT) {
    return false
  }

  // Increment usage
  usage[toolId].count += 1
  usage[toolId].lastUsed = Date.now()

  // Save updated usage
  saveUsage(usage)

  return true
}

// Get remaining usage for a tool
export const getRemainingUsage = (toolId: string): number => {
  const usage = getStoredUsage()

  if (!usage[toolId]) {
    return FREE_USAGE_LIMIT
  }

  return Math.max(0, FREE_USAGE_LIMIT - usage[toolId].count)
}

// Check if a tool has reached its usage limit
export const hasReachedLimit = (toolId: string): boolean => {
  return getRemainingUsage(toolId) <= 0
}

// Reset usage for all tools (e.g., after login)
export const resetUsage = (): void => {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}
