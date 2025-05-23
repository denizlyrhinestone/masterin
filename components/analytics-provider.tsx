"use client"

import { createContext, useContext, type ReactNode } from "react"

interface AnalyticsContextType {
  track: (event: string, properties?: Record<string, any>) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const track = (event: string, properties?: Record<string, any>) => {
    // In a real app, this would send to your analytics service
    console.log("Analytics event:", event, properties)
  }

  return <AnalyticsContext.Provider value={{ track }}>{children}</AnalyticsContext.Provider>
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider")
  }
  return context
}
