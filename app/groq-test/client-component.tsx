"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import { isGroqConfigured } from "@/lib/env-config"

export default function GroqTestClient() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [result, setResult] = useState<string>("")
  const [responseTime, setResponseTime] = useState<number | null>(null)

  const isConfigured = isGroqConfigured()

  const runTest = async () => {
    try {
      setStatus("loading")
      setResult("")
      setResponseTime(null)

      const startTime = Date.now()
      const response = await fetch("/api/test-groq")
      const endTime = Date.now()

      const data = await response.json()

      setResponseTime(endTime - startTime)

      if (data.success) {
        setStatus("success")
        setResult(data.message || "Successfully connected to Groq API")
      } else {
        setStatus("error")
        setResult(data.error || "Failed to connect to Groq API")
      }
    } catch (error) {
      setStatus("error")
      setResult("An error occurred while testing the connection")
    }
  }

  if (!isConfigured) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Configuration Error</AlertTitle>
        <AlertDescription>
          The Groq API key is not configured. Please add the GROQ_API_KEY environment variable.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <Button onClick={runTest} disabled={status === "loading"} className="w-full sm:w-auto">
        {status === "loading" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Testing Connection...
          </>
        ) : (
          "Test Groq API Connection"
        )}
      </Button>

      {status === "success" && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">
            {result}
            {responseTime && <p className="text-sm mt-1">Response time: {responseTime}ms</p>}
          </AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{result}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
