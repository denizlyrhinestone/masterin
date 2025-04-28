"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react"
import { GROQ_API_KEY } from "@/lib/env-config"

export default function AIStatusClientComponent() {
  const [isLoading, setIsLoading] = useState(true)
  const [groqStatus, setGroqStatus] = useState<{ available: boolean; message: string }>({
    available: false,
    message: "Checking Groq API status...",
  })
  const [testResponse, setTestResponse] = useState<string | null>(null)
  const [isTestingGroq, setIsTestingGroq] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkGroqStatus()
  }, [])

  const checkGroqStatus = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/check-groq", {
        method: "GET",
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()
      setGroqStatus({
        available: data.status === "available",
        message: data.message || (data.status === "available" ? "Groq API is available" : "Groq API is unavailable"),
      })
    } catch (err) {
      setError("Error checking Groq availability: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setIsLoading(false)
    }
  }

  const testGroqAPI = async () => {
    setIsTestingGroq(true)
    setTestResponse(null)
    setError(null)

    try {
      const response = await fetch("/api/test-groq", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()
      setTestResponse(data.response || "No response received")
    } catch (err) {
      setError("Error testing Groq API: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setIsTestingGroq(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Groq API Status</CardTitle>
        <CardDescription>Check the status of the Groq API integration</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mr-2" />
            <span>Checking Groq API status...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">API Key Status</h3>
                <p className="text-sm text-gray-500">
                  {GROQ_API_KEY ? "API key is configured" : "API key is not configured"}
                </p>
              </div>
              <Badge className={groqStatus.available ? "bg-green-500" : "bg-red-500"}>
                {groqStatus.available ? "Available" : "Unavailable"}
              </Badge>
            </div>

            <Alert variant={groqStatus.available ? "default" : "destructive"}>
              {groqStatus.available ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <AlertTitle>{groqStatus.available ? "Groq API is available" : "Groq API is unavailable"}</AlertTitle>
              <AlertDescription>{groqStatus.message}</AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {testResponse && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                <h3 className="font-medium mb-2">Test Response:</h3>
                <p className="text-sm whitespace-pre-wrap">{testResponse}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={checkGroqStatus} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
        <Button onClick={testGroqAPI} disabled={isLoading || isTestingGroq || !groqStatus.available}>
          {isTestingGroq ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            "Test Groq API"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
