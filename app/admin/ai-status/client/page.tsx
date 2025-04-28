"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react"
import { GROQ_API_KEY } from "@/lib/env-config"
import Link from "next/link"

export default function ClientAIStatusPage() {
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
      setGroqStatus({
        available: false,
        message: "Failed to check Groq API status",
      })
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
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Link href="/admin/ai-status" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">AI Service Status</h1>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>AI Configuration Guide</CardTitle>
          <CardDescription>How to set up and configure the AI service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-medium">Setting up Groq API</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                Create an account at{" "}
                <a
                  href="https://console.groq.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Groq Console
                </a>
              </li>
              <li>Generate an API key from your account settings</li>
              <li>
                Add the API key to your environment variables as{" "}
                <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">GROQ_API_KEY</code>
              </li>
              <li>Restart your application</li>
            </ol>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md mt-4">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-300 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Important Note
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-200 mt-1">
                Keep your API key secure and never expose it in client-side code. The key should only be used in
                server-side API routes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
