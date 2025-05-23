"use client"

import { useEffect } from "react"

interface AnalyticsEventProps {
  event: string
  properties?: Record<string, any>
}

export function AnalyticsEvent({ event, properties }: AnalyticsEventProps) {
  useEffect(() => {
    // This is a placeholder for actual analytics tracking
    // In a real application, you would use your analytics provider here
    console.log(`Analytics event: ${event}`, properties)
  }, [event, properties])

  return null
}
