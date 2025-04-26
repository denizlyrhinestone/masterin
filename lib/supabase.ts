import { createClient } from "@supabase/supabase-js"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { logError } from "@/lib/error-logger"

// Create a single supabase client for the entire client-side application
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables are missing. Some functionality may not work correctly.", {
    url: supabaseUrl ? "✓" : "✗",
    key: supabaseAnonKey ? "✓" : "✗",
  })

  // Log this as a critical error
  if (typeof window !== "undefined") {
    logError(new Error("Supabase environment variables are missing"), {
      severity: "critical",
      context: {
        url: !!supabaseUrl,
        key: !!supabaseAnonKey,
      },
    })
  }
}

// Create client with error handling and fallback mechanism
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: (...args) => {
      return fetch(...args).catch((err) => {
        console.error("Supabase fetch error:", err)
        logError(err instanceof Error ? err : new Error(String(err)), {
          severity: "high",
          context: { operation: "supabase-fetch" },
        })
        throw err
      })
    },
  },
})

// Service role client for admin operations (use with caution)
export const supabaseAdmin = (() => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  if (!serviceRoleKey && process.env.NODE_ENV === "production") {
    console.error("SUPABASE_SERVICE_ROLE_KEY is missing. Admin operations will not work.")
    logError(new Error("SUPABASE_SERVICE_ROLE_KEY is missing"), {
      severity: "critical",
      context: { environment: process.env.NODE_ENV },
    })
  }

  return createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: (...args) => {
        return fetch(...args).catch((err) => {
          console.error("Supabase admin fetch error:", err)
          logError(err instanceof Error ? err : new Error(String(err)), {
            severity: "high",
            context: { operation: "supabase-admin-fetch" },
          })
          throw err
        })
      },
    },
  })
})()

// This function is safe to use in API routes and server components
// but should NOT be imported in pages/ directory components
export async function getServerSupabaseClient(requestOrResponse?: Request | Response) {
  try {
    // Dynamic import to prevent webpack from bundling this with pages/ components
    const { cookies } = await import("next/headers")

    const cookieStore = cookies()

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )
  } catch (error) {
    console.error("Error creating server Supabase client:", error)
    logError(error instanceof Error ? error : new Error(String(error)), {
      severity: "high",
      context: { operation: "getServerSupabaseClient" },
    })

    // Return a fallback client that will work but with limited functionality
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }
}

// Alternative server-side client that doesn't use next/headers
// Safe to use in pages/ directory and API routes
export function createServerSupabaseClient() {
  try {
    // Use the admin client instead for server operations
    // This doesn't rely on cookies() from next/headers
    return supabaseAdmin
  } catch (error) {
    console.error("Error creating server Supabase client:", error)
    logError(error instanceof Error ? error : new Error(String(error)), {
      severity: "high",
      context: { operation: "createServerSupabaseClient" },
    })

    // Return a fallback client that will work but with limited functionality
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }
}

// Test the Supabase connection
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    // First check if we have the required environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase connection test failed: Missing environment variables")
      return false
    }

    const { data, error } = await supabase.from("chat_conversations").select("count", { count: "exact", head: true })
    if (error) {
      console.error("Supabase connection test failed:", error)
      logError(new Error(`Supabase connection test failed: ${error.message}`), {
        severity: "high",
        context: { operation: "testSupabaseConnection", error },
      })
      return false
    }
    return true
  } catch (error) {
    console.error("Supabase connection test error:", error)
    logError(error instanceof Error ? error : new Error(String(error)), {
      severity: "high",
      context: { operation: "testSupabaseConnection" },
    })
    return false
  }
}

// Fallback functions for when Supabase is not available
export const supabaseFallbacks = {
  // Fallback for authentication
  auth: {
    async signIn() {
      console.warn("Supabase auth not available, using fallback")
      return { error: new Error("Authentication service is currently unavailable") }
    },
    async signUp() {
      console.warn("Supabase auth not available, using fallback")
      return { error: new Error("Authentication service is currently unavailable") }
    },
    async signOut() {
      console.warn("Supabase auth not available, using fallback")
      return { error: null }
    },
    async getSession() {
      console.warn("Supabase auth not available, using fallback")
      return { data: { session: null }, error: null }
    },
  },

  // Fallback for database operations
  db: {
    async getUser() {
      console.warn("Supabase database not available, using fallback")
      return { data: null, error: new Error("Database service is currently unavailable") }
    },
    async saveData() {
      console.warn("Supabase database not available, using fallback")
      return { error: new Error("Database service is currently unavailable") }
    },
  },
}
