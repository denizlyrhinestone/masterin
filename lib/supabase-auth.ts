import { createClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// Determine the site URL based on environment
const getSiteUrl = () => {
  // For Vercel deployments, use VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // For local development, use localhost with the correct port
  // Default to 3000 if not specified
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
}

// Create a singleton instance for the browser
export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    // Set the site URL for redirects
    flowType: "pkce",
    detectSessionInUrl: true,
    // Set the site URL for redirects
    redirectTo: `${getSiteUrl()}/auth/callback`,
  },
})

// Server-side client (for protected routes)
export const createServerSupabaseClient = () => {
  return createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}

export async function getUser() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    console.error("Error getting user:", error)
    return null
  }

  return data.user
}
