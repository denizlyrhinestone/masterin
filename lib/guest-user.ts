"use client"

// Utility functions for managing guest user data
import { v4 as uuidv4 } from "uuid"

export type GuestConversation = {
  id: string
  title: string
  updated_at: string
}

export type GuestMessage = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt?: Date
  attachments?: any[]
}

// Generate a unique guest ID
export const generateGuestId = (): string => {
  // Try to get existing ID from localStorage first
  if (typeof window !== "undefined") {
    const existingId = localStorage.getItem("masterin_guest_id")
    if (existingId) {
      return existingId
    }

    // Create new ID if none exists
    const newId = `guest-${uuidv4()}`
    localStorage.setItem("masterin_guest_id", newId)
    return newId
  }

  // Fallback for SSR context
  return `guest-${uuidv4()}`
}

// Get guest conversations from localStorage
export const getGuestConversations = (): GuestConversation[] => {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem("guest_conversations")
    if (!stored) return []
    return JSON.parse(stored)
  } catch (error) {
    console.error("Error reading guest conversations:", error)
    return []
  }
}

// Save guest conversations to localStorage
export const saveGuestConversations = (conversations: GuestConversation[]): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem("guest_conversations", JSON.stringify(conversations))
  } catch (error) {
    console.error("Error saving guest conversations:", error)
  }
}

// Get guest messages from localStorage
export const getGuestMessages = (conversationId: string): GuestMessage[] => {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(`guest_messages_${conversationId}`)
    if (!stored) return []
    return JSON.parse(stored)
  } catch (error) {
    console.error("Error reading guest messages:", error)
    return []
  }
}

// Save guest messages to localStorage
export const saveGuestMessages = (conversationId: string, messages: GuestMessage[]): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(`guest_messages_${conversationId}`, JSON.stringify(messages))
  } catch (error) {
    console.error("Error saving guest messages:", error)
  }
}

// Update guest conversation
export const updateGuestConversation = (id: string, title: string): GuestConversation[] => {
  const existingConversations = getGuestConversations()
  const now = new Date().toISOString()

  // Check if conversation already exists
  const existingIndex = existingConversations.findIndex((c) => c.id === id)

  if (existingIndex >= 0) {
    // Update existing conversation
    existingConversations[existingIndex] = {
      ...existingConversations[existingIndex],
      title: title.slice(0, 50) + (title.length > 50 ? "..." : ""),
      updated_at: now,
    }
  } else {
    // Add new conversation
    existingConversations.push({
      id,
      title: title.slice(0, 50) + (title.length > 50 ? "..." : ""),
      updated_at: now,
    })
  }

  // Save updated conversations
  saveGuestConversations(existingConversations)

  return existingConversations
}

// Delete guest conversation
export const deleteGuestConversation = (id: string): GuestConversation[] => {
  const existingConversations = getGuestConversations()
  const updatedConversations = existingConversations.filter((c) => c.id !== id)

  saveGuestConversations(updatedConversations)

  // Also delete messages for this conversation
  if (typeof window !== "undefined") {
    localStorage.removeItem(`guest_messages_${id}`)
  }

  return updatedConversations
}

// Clear all guest data (for debugging or reset)
export const clearAllGuestData = (): void => {
  if (typeof window === "undefined") return

  try {
    // Get all conversation IDs first
    const conversations = getGuestConversations()

    // Remove all message stores
    conversations.forEach((conv) => {
      localStorage.removeItem(`guest_messages_${conv.id}`)
    })

    // Remove conversations list and guest ID
    localStorage.removeItem("guest_conversations")
    localStorage.removeItem("masterin_guest_id")
  } catch (error) {
    console.error("Error clearing guest data:", error)
  }
}
