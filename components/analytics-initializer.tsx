"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { initializeAnalytics, trackPageView } from "@/lib/analytics"

export function AnalyticsInitializer() {
  const pathname = usePathname()
  const [initialized, setInitialized] = useState(false)

  // Initialize analytics once on client-side
  useEffect(() => {
    if (!initialized) {
      const success = initializeAnalytics()
      setInitialized(success)
    }
  }, [initialized])

  // Track page views when the pathname changes
  useEffect(() => {
    if (initialized && pathname) {
      trackPageView(pathname)
    }
  }, [pathname, initialized])

  // This component doesn't render anything
  return null
}
