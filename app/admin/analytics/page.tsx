"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { getAnalyticsStatus, trackEvent } from "@/lib/analytics"
import { InfoIcon, AlertTriangleIcon, CheckCircleIcon } from "lucide-react"

export default function AnalyticsAdminPage() {
  const [status, setStatus] = useState<ReturnType<typeof getAnalyticsStatus> | null>(null)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null)

  // Get the current analytics status
  useEffect(() => {
    setStatus(getAnalyticsStatus())
  }, [])

  // Test tracking an event
  const handleTestEvent = () => {
    setTestResult("Sending test event...")
    setTestSuccess(null)

    const success = trackEvent("admin_test", {
      source: "admin_panel",
      timestamp: new Date().toISOString(),
    })

    if (success) {
      setTestResult("Test event sent successfully! Check your Google Analytics dashboard.")
      setTestSuccess(true)
    } else {
      setTestResult("Failed to send test event. Analytics may be disabled or not initialized properly.")
      setTestSuccess(false)
    }
  }

  if (!status) {
    return <div className="p-8">Loading analytics status...</div>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Analytics Settings</h1>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Analytics Status</CardTitle>
              <Badge variant={status.enabled ? "success" : "destructive"}>
                {status.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <CardDescription>
              Control analytics tracking via the NEXT_PUBLIC_ENABLE_ANALYTICS environment variable
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Environment Variable</h3>
              <p className="mt-1 text-sm">
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  NEXT_PUBLIC_ENABLE_ANALYTICS={status.environmentValue}
                </code>
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Measurement ID</h3>
              <p className="mt-1 text-sm">
                {status.measurementId ? (
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{status.measurementId}</code>
                ) : (
                  <span className="text-gray-500">Not available (analytics disabled)</span>
                )}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Initialization Status</h3>
              <p className="mt-1 text-sm flex items-center">
                {status.initialized ? (
                  <>
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    Initialized successfully
                  </>
                ) : (
                  <>
                    <AlertTriangleIcon className="h-4 w-4 text-amber-500 mr-2" />
                    Not initialized
                  </>
                )}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start space-y-4">
            <Button onClick={handleTestEvent} disabled={!status.enabled || !status.initialized}>
              Test Analytics Event
            </Button>

            {testResult && (
              <Alert variant={testSuccess ? "default" : "destructive"}>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Test Result</AlertTitle>
                <AlertDescription>{testResult}</AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How to Configure Analytics</CardTitle>
          <CardDescription>Instructions for enabling or disabling analytics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Local Development</h3>
            <p className="text-sm mt-1">
              Add the following to your <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">.env.local</code>{" "}
              file:
            </p>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded mt-2 overflow-x-auto">
              <code>NEXT_PUBLIC_ENABLE_ANALYTICS=true</code>
            </pre>
          </div>

          <div>
            <h3 className="font-medium">Production Environment</h3>
            <p className="text-sm mt-1">Add the environment variable in your Vercel dashboard:</p>
            <ol className="list-decimal list-inside mt-2 text-sm space-y-2">
              <li>Go to your Vercel project</li>
              <li>Navigate to Settings → Environment Variables</li>
              <li>
                Add <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">NEXT_PUBLIC_ENABLE_ANALYTICS</code> with
                value <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">true</code>
              </li>
              <li>Deploy your application</li>
            </ol>
          </div>

          <div>
            <h3 className="font-medium">Disable Analytics</h3>
            <p className="text-sm mt-1">
              To disable analytics, set the environment variable to{" "}
              <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">false</code> or remove it.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
