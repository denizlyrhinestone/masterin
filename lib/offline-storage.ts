import { openDB, type DBSchema, type IDBPDatabase } from "idb"

interface LearnWiseDB extends DBSchema {
  "ai-tutor-sessions": {
    key: string
    value: {
      id: string
      title: string
      subject: string | null
      created_at: string
      updated_at: string
      user_id: string
      messages: Array<{
        id: string
        content: string
        sender: "user" | "ai"
        created_at: string
      }>
      synced: boolean
    }
    indexes: { "by-user": string }
  }
  "ai-assignments": {
    key: string
    value: {
      id: string
      title: string
      subject: string
      topic: string
      difficulty: string
      content: any
      created_at: string
      user_id: string
      is_public: boolean
      synced: boolean
    }
    indexes: { "by-user": string }
  }
  "ai-quizzes": {
    key: string
    value: {
      id: string
      title: string
      subject: string
      topic: string
      difficulty: string
      content: any
      created_at: string
      user_id: string
      is_public: boolean
      synced: boolean
    }
    indexes: { "by-user": string }
  }
  "ai-flashcard-decks": {
    key: string
    value: {
      id: string
      title: string
      subject: string
      topic: string
      created_at: string
      user_id: string
      is_public: boolean
      cards: Array<{
        id: string
        front: string
        back: string
        category?: string
        created_at: string
      }>
      synced: boolean
    }
    indexes: { "by-user": string }
  }
  "sync-queue": {
    key: string
    value: {
      id: string
      operation: "create" | "update" | "delete"
      table: string
      data: any
      timestamp: number
    }
  }
}

let db: IDBPDatabase<LearnWiseDB> | null = null

export async function getDB() {
  if (!db) {
    db = await openDB<LearnWiseDB>("learnwise-db", 1, {
      upgrade(db) {
        // AI Tutor Sessions
        if (!db.objectStoreNames.contains("ai-tutor-sessions")) {
          const tutorStore = db.createObjectStore("ai-tutor-sessions", { keyPath: "id" })
          tutorStore.createIndex("by-user", "user_id")
        }

        // AI Assignments
        if (!db.objectStoreNames.contains("ai-assignments")) {
          const assignmentsStore = db.createObjectStore("ai-assignments", { keyPath: "id" })
          assignmentsStore.createIndex("by-user", "user_id")
        }

        // AI Quizzes
        if (!db.objectStoreNames.contains("ai-quizzes")) {
          const quizzesStore = db.createObjectStore("ai-quizzes", { keyPath: "id" })
          quizzesStore.createIndex("by-user", "user_id")
        }

        // AI Flashcard Decks
        if (!db.objectStoreNames.contains("ai-flashcard-decks")) {
          const flashcardsStore = db.createObjectStore("ai-flashcard-decks", { keyPath: "id" })
          flashcardsStore.createIndex("by-user", "user_id")
        }

        // Sync Queue
        if (!db.objectStoreNames.contains("sync-queue")) {
          db.createObjectStore("sync-queue", { keyPath: "id" })
        }
      },
    })
  }
  return db
}

// Generic CRUD operations
export async function saveToOfflineStorage<T extends { id: string }>(
  storeName: keyof LearnWiseDB,
  data: T,
  userId: string,
) {
  const db = await getDB()
  const item = { ...data, user_id: userId, synced: false }
  await db.put(storeName, item)

  // Add to sync queue
  await db.put("sync-queue", {
    id: `${storeName}-${data.id}-${Date.now()}`,
    operation: "create",
    table: storeName as string,
    data: item,
    timestamp: Date.now(),
  })

  return item
}

export async function getFromOfflineStorage<T>(storeName: keyof LearnWiseDB, id: string): Promise<T | undefined> {
  const db = await getDB()
  return db.get(storeName, id) as Promise<T | undefined>
}

export async function getAllFromOfflineStorage<T>(storeName: keyof LearnWiseDB, userId: string): Promise<T[]> {
  const db = await getDB()
  return db.getAllFromIndex(storeName, "by-user", userId) as Promise<T[]>
}

export async function deleteFromOfflineStorage(storeName: keyof LearnWiseDB, id: string) {
  const db = await getDB()
  const item = await db.get(storeName, id)

  if (item) {
    await db.delete(storeName, id)

    // Add to sync queue
    await db.put("sync-queue", {
      id: `${storeName}-${id}-${Date.now()}`,
      operation: "delete",
      table: storeName as string,
      data: { id },
      timestamp: Date.now(),
    })
  }

  return true
}

// Sync operations
export async function syncWithServer(userId: string) {
  if (!navigator.onLine) {
    return { success: false, message: "No internet connection" }
  }

  const db = await getDB()
  const syncQueue = await db.getAll("sync-queue")

  if (syncQueue.length === 0) {
    return { success: true, message: "Nothing to sync" }
  }

  // Sort by timestamp to ensure operations are processed in order
  syncQueue.sort((a, b) => a.timestamp - b.timestamp)

  const results = []

  for (const item of syncQueue) {
    try {
      let endpoint = ""
      let method = "POST"

      switch (item.table) {
        case "ai-tutor-sessions":
          endpoint = "/api/ai/tutor/sync"
          break
        case "ai-assignments":
          endpoint = "/api/ai/assignments/sync"
          break
        case "ai-quizzes":
          endpoint = "/api/ai/quizzes/sync"
          break
        case "ai-flashcard-decks":
          endpoint = "/api/ai/flashcards/sync"
          break
        default:
          continue
      }

      if (item.operation === "delete") {
        method = "DELETE"
      } else if (item.operation === "update") {
        method = "PUT"
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...item.data,
          user_id: userId,
        }),
      })

      if (response.ok) {
        // Mark as synced in the local DB
        if (item.operation !== "delete") {
          const data = await response.json()
          await db.put(item.table as keyof LearnWiseDB, {
            ...item.data,
            ...data,
            synced: true,
          })
        }

        // Remove from sync queue
        await db.delete("sync-queue", item.id)

        results.push({
          id: item.id,
          success: true,
        })
      } else {
        results.push({
          id: item.id,
          success: false,
          error: await response.text(),
        })
      }
    } catch (error) {
      results.push({
        id: item.id,
        success: false,
        error: error.message,
      })
    }
  }

  return {
    success: results.every((r) => r.success),
    results,
  }
}

// Check if we're offline
export function isOffline() {
  return !navigator.onLine
}

// Listen for online/offline events
export function setupOfflineListeners(onStatusChange: (isOffline: boolean) => void) {
  window.addEventListener("online", () => onStatusChange(false))
  window.addEventListener("offline", () => onStatusChange(true))

  return () => {
    window.removeEventListener("online", () => onStatusChange(false))
    window.removeEventListener("offline", () => onStatusChange(true))
  }
}

// Background sync when app comes online
export function setupBackgroundSync(userId: string) {
  let syncTimeout: NodeJS.Timeout | null = null

  const handleOnline = async () => {
    if (syncTimeout) {
      clearTimeout(syncTimeout)
    }

    // Wait a bit to ensure connection is stable
    syncTimeout = setTimeout(() => {
      syncWithServer(userId)
    }, 3000)
  }

  window.addEventListener("online", handleOnline)

  return () => {
    window.removeEventListener("online", handleOnline)
    if (syncTimeout) {
      clearTimeout(syncTimeout)
    }
  }
}
