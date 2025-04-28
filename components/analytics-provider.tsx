"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { trackPageView, initializeAnalytics } from "@/lib/analytics"

// Remove useSearchParams from this component to avoid the Suspense requirement
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize analytics only once on client-side
  useEffect(() => {
    if (!isInitialized) {
      initializeAnalytics()
      setIsInitialized(true)
    }
  }, [isInitialized])

  // Track page views when the pathname changes
  useEffect(() => {
    if (isInitialized && pathname) {
      // Track page view without search params
      trackPageView(pathname)
    }
  }, [pathname, isInitialized])

  return <>{children}</>
}

// Separate component for tracking events
export function AnalyticsEventTracker({
  eventName,
  eventParams,
  onTrack,
}: {
  eventName: string
  eventParams?: Record<string, string>
  onTrack?: (success: boolean) => void
}) {
  useEffect(() => {
    // Implementation remains the same
  }, [eventName, eventParams, onTrack])

  return null
}
