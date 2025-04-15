"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function DiagnosticPage() {
  const [loading, setLoading] = useState(true)
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkSupabaseConnection = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/diagnostic/supabase")
      const data = await response.json()
      setSupabaseStatus(data)
    } catch (err) {
      setError(`Failed to check Supabase connection: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSupabaseConnection()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">System Diagnostic</h1>

      <Button onClick={checkSupabaseConnection} disabled={loading} className="mb-6">
        {loading ? "Checking Connection..." : "Check Supabase Connection"}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Status</CardTitle>
          <CardDescription>Checking connection to Supabase database</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Checking connection...</div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : supabaseStatus?.success ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Connection successful!</span>
              <pre className="mt-4 p-4 bg-slate-100 rounded-md overflow-auto text-xs">
                {JSON.stringify(supabaseStatus, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>Connection failed: {supabaseStatus?.error}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
