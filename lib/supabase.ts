import { createClient } from "@supabase/supabase-js"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

// Create a single supabase client for the entire client-side application
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
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
  },
)

// This function is safe to use in API routes and server components
// but should NOT be imported in pages/ directory components
export async function getServerSupabaseClient(requestOrResponse?: Request | Response) {
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
}

// Alternative server-side client that doesn't use next/headers
// Safe to use in pages/ directory and API routes
export function createServerSupabaseClient() {
  // Use the admin client instead for server operations
  // This doesn't rely on cookies() from next/headers
  return supabaseAdmin
}
