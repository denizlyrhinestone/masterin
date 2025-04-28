// Analytics utility functions

// Import the environment config
import { NEXT_PUBLIC_ENABLE_ANALYTICS } from "@/lib/env-config"

// Google Analytics Measurement ID - typically starts with "G-"
// In a real implementation, this would also be an environment variable
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX"

// Type for analytics events
type AnalyticsEvent = {
  action: string
  category?: string
  label?: string
  value?: number
  // Additional properties can be added as needed
  [key: string]: any
}

/**
 * Initialize Google Analytics
 * This function safely initializes GA only if analytics are enabled
 */
export const initializeAnalytics = () => {
  try {
    if (!NEXT_PUBLIC_ENABLE_ANALYTICS) {
      console.log("Analytics are disabled via NEXT_PUBLIC_ENABLE_ANALYTICS")
      return false
    }

    if (typeof window === "undefined") {
      return false // Don't run during SSR
    }

    // Check if GA is already initialized
    if (window.gtag) {
      return true
    }

    // Load Google Analytics script
    const script = document.createElement("script")
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    script.async = true
    document.head.appendChild(script)

    // Initialize gtag
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() {
      window.dataLayer.push(arguments)
    }
    window.gtag("js", new Date())
    window.gtag("config", GA_MEASUREMENT_ID, {
      send_page_view: false, // We'll handle page views manually
    })

    console.log("Analytics initialized successfully")
    return true
  } catch (error) {
    console.error("Failed to initialize analytics:", error)
    return false
  }
}

/**
 * Track a page view
 * @param url The URL to track
 */
export const trackPageView = (url: string) => {
  try {
    if (!NEXT_PUBLIC_ENABLE_ANALYTICS) {
      return false
    }

    if (typeof window === "undefined" || !window.gtag) {
      return false
    }

    window.gtag("event", "page_view", {
      page_path: url,
    })
    return true
  } catch (error) {
    console.error("Failed to track page view:", error)
    return false
  }
}

/**
 * Track a custom event
 * @param event The event to track
 */
export const trackEvent = (event: AnalyticsEvent) => {
  try {
    if (!NEXT_PUBLIC_ENABLE_ANALYTICS) {
      return false
    }

    if (typeof window === "undefined" || !window.gtag) {
      return false
    }

    window.gtag("event", event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event, // Include any additional properties
    })
    return true
  } catch (error) {
    console.error("Failed to track event:", error)
    return false
  }
}

/**
 * Check if analytics are currently enabled and working
 * @returns Object with status and details
 */
export const checkAnalyticsStatus = () => {
  // Check environment variable
  const envEnabled = NEXT_PUBLIC_ENABLE_ANALYTICS

  // Check if GA is loaded
  const gaLoaded = typeof window !== "undefined" && !!window.gtag

  return {
    enabled: envEnabled,
    initialized: gaLoaded,
    measurementId: envEnabled ? GA_MEASUREMENT_ID : null,
  }
}
