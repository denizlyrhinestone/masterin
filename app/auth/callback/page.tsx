"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // This effect will run once when the component mounts
    const handleAuthCallback = async () => {
      try {
        // Get the auth code from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const queryParams = new URLSearchParams(window.location.search)

        // Check if we have an access token in the URL (OAuth success)
        if (hashParams.get("access_token") || queryParams.get("code")) {
          // The supabase client will automatically handle the token exchange
          const { data, error } = await supabase.auth.getSession()

          if (error) {
            console.error("Error in auth callback:", error)
            router.push("/auth/sign-in?error=auth_callback_failed")
            return
          }

          if (data.session) {
            // Successfully authenticated
            router.push("/")
            return
          }
        }

        // If we get here, something went wrong
        router.push("/auth/sign-in")
      } catch (error) {
        console.error("Unexpected error in auth callback:", error)
        router.push("/auth/sign-in?error=unexpected")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-4" />
      <h2 className="text-xl font-semibold">Completing authentication...</h2>
      <p className="text-gray-500 dark:text-gray-400">Please wait while we log you in</p>
    </div>
  )
}
