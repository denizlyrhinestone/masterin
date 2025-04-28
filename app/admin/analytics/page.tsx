"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { trackEvent, checkAnalyticsStatus } from "@/lib/analytics"
import { NEXT_PUBLIC_ENABLE_ANALYTICS } from "@/lib/env-config"

export default function AnalyticsAdminPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testResult, setTestResult] = useState<string | null>(null)

  // Fetch the analytics status
  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch("/api/analytics/status")
        const data = await response.json()
        setStatus(data)
      } catch (error) {
        console.error("Failed to fetch analytics status:", error)
        setStatus({ error: "Failed to fetch analytics status" })
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [])

  // Test tracking an event
  const handleTestEvent = () => {
    setTestResult("Sending test event...")

    const result = trackEvent({
      action: "test_event",
      category: "admin",
      label: "analytics_test",
      value: Date.now(),
    })

    if (result) {
      setTestResult("Test event sent successfully!")
    } else {
      setTestResult("Failed to send test event. Analytics may be disabled.")
    }
  }

  // Check client-side status
  const clientStatus = checkAnalyticsStatus()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Analytics Status</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Environment Configuration</CardTitle>
            <CardDescription>Current analytics environment settings</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading status...</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">NEXT_PUBLIC_ENABLE_ANALYTICS:</h3>
                  <p className={NEXT_PUBLIC_ENABLE_ANALYTICS ? "text-green-600" : "text-red-600"}>
                    {String(NEXT_PUBLIC_ENABLE_ANALYTICS)}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Raw Environment Variable:</h3>
                  <p>{status?.environmentVariable || "Not available"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client-Side Status</CardTitle>
            <CardDescription>Current status of analytics in the browser</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Enabled:</h3>
                <p className={clientStatus.enabled ? "text-green-600" : "text-red-600"}>
                  {String(clientStatus.enabled)}
                </p>
              </div>

              <div>
                <h3 className="font-medium">Initialized:</h3>
                <p className={clientStatus.initialized ? "text-green-600" : "text-red-600"}>
                  {String(clientStatus.initialized)}
                </p>
              </div>

              {clientStatus.measurementId && (
                <div>
                  <h3 className="font-medium">Measurement ID:</h3>
                  <p>{clientStatus.measurementId}</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleTestEvent} disabled={!clientStatus.enabled || !clientStatus.initialized}>
              Test Analytics Event
            </Button>
            {testResult && <p className="ml-4 text-sm">{testResult}</p>}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
