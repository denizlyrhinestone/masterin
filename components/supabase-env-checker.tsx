"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { testSupabaseConnection } from "@/lib/supabase"

export function SupabaseEnvChecker() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  useEffect(() => {
    const checkSupabase = async () => {
      try {
        // Check if environment variables are set
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey) {
          setStatus("error")
          setErrorDetails(
            `Missing Supabase environment variables: ${!supabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL" : ""} ${
              !supabaseKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : ""
            }`,
          )
          return
        }

        // Test connection
        const connectionSuccess = await testSupabaseConnection()
        if (!connectionSuccess) {
          setStatus("error")
          setErrorDetails("Could not connect to Supabase. Please check your configuration.")
          return
        }

        setStatus("success")
      } catch (error) {
        setStatus("error")
        setErrorDetails(error instanceof Error ? error.message : "Unknown error checking Supabase configuration")
      }
    }

    checkSupabase()
  }, [])

  if (status === "loading" || status === "success") {
    return null
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Supabase Configuration Error</AlertTitle>
      <AlertDescription>
        {errorDetails || "There was an error with your Supabase configuration."}
        <div className="mt-2 text-sm">Please check your environment variables and ensure they are correctly set.</div>
      </AlertDescription>
    </Alert>
  )
}
