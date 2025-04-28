"use client"

import type React from "react"

import { useEffect } from "react"
import { trackEvent } from "@/lib/analytics"

type AnalyticsEventProps = {
  eventName: string
  eventParams?: Record<string, any>
  fireOnMount?: boolean
  children?: React.ReactNode
  onClick?: () => void
}

/**
 * Component to track analytics events
 * Can be used to track events on mount or on click
 */
export function AnalyticsEvent({
  eventName,
  eventParams,
  fireOnMount = false,
  children,
  onClick,
}: AnalyticsEventProps) {
  // Track event on mount if fireOnMount is true
  useEffect(() => {
    if (fireOnMount) {
      trackEvent(eventName, eventParams)
    }
  }, [eventName, eventParams, fireOnMount])

  // Handle click event
  const handleClick = () => {
    trackEvent(eventName, eventParams)
    if (onClick) onClick()
  }

  // If children are provided, wrap them in a div with onClick
  if (children) {
    return (
      <div onClick={handleClick} style={{ display: "contents" }}>
        {children}
      </div>
    )
  }

  // Otherwise, return null (useful for tracking on mount only)
  return null
}
