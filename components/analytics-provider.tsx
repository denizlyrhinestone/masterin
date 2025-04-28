"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { initializeAnalytics, trackPageView } from "@/lib/analytics"
import { NEXT_PUBLIC_ENABLE_ANALYTICS } from "@/lib/env-config"

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize analytics on first render
  useEffect(() => {
    if (NEXT_PUBLIC_ENABLE_ANALYTICS && !isInitialized) {
      const initialized = initializeAnalytics()
      setIsInitialized(initialized)
    }
  }, [isInitialized])

  // Track page views when the route changes
  useEffect(() => {
    if (isInitialized) {
      // Combine pathname and search params
      const url = searchParams?.size ? `${pathname}?${searchParams.toString()}` : pathname

      // Track the page view
      trackPageView(url)
    }
  }, [pathname, searchParams, isInitialized])

  return <>{children}</>
}

// This component can be used to manually track events
export function AnalyticsEventTracker({
  children,
  action,
  category,
  label,
  value,
  ...props
}: {
  children: React.ReactNode
  action: string
  category?: string
  label?: string
  value?: number
  [key: string]: any
}) {
  const handleClick = () => {
    if (NEXT_PUBLIC_ENABLE_ANALYTICS) {
      import("@/lib/analytics").then(({ trackEvent }) => {
        trackEvent({
          action,
          category,
          label,
          value,
          ...props,
        })
      })
    }
  }

  return <div onClick={handleClick}>{children}</div>
}
