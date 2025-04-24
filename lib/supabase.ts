import { createClient } from "@supabase/supabase-js"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

// Create a single supabase client for the entire client-side application
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables are missing. Some functionality may not work correctly.", {
    url: supabaseUrl ? "✓" : "✗",
    key: supabaseAnonKey ? "✓" : "✗",
  })
}

// Create client with error handling
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
        throw err
      })
    },
  },
})

// Service role client for admin operations (use with caution)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: (...args) => {
        return fetch(...args).catch((err) => {
          console.error("Supabase admin fetch error:", err)
          throw err
        })
      },
    },
  },
)

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
    const { data, error } = await supabase.from("chat_conversations").select("count", { count: "exact", head: true })
    if (error) {
      console.error("Supabase connection test failed:", error)
      return false
    }
    return true
  } catch (error) {
    console.error("Supabase connection test error:", error)
    return false
  }
}
